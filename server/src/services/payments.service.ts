import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import * as cashflowService from './cashflow.service';

const prisma = new PrismaClient();

interface SubmitPaymentInput {
  orderId: string;
  amount: number;
  paymentType: 'partial' | 'full';
  referenceNumber: string;
  total?: number;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  orderItems?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    size?: string;
    color?: string;
    customizationData?: {
      productId: number;
      frontDesignUrl?: string;
      backDesignUrl?: string;
      frontCanvasJson?: string;
      backCanvasJson?: string;
    };
  }>;
}

interface PaymentResult {
  paymentId: number;
  orderId: number;
  paymentType: 'partial' | 'full';
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

/**
 * Submit a payment with receipt
 * If order doesn't exist, it will be created
 */
export async function submitPayment(data: SubmitPaymentInput): Promise<PaymentResult> {
  const { orderId, amount, paymentType, referenceNumber, total, customerInfo, orderItems } = data;

  // Validate reference number
  if (!referenceNumber || referenceNumber.trim() === '') {
    throw new Error('GCash reference number is required');
  }

  // Find or create order
  let order = await prisma.orders.findUnique({
    where: { order_ref: orderId },
  });

  // If order doesn't exist, create it
  if (!order) {
    if (!customerInfo || !orderItems || !total) {
      throw new Error('Order not found and missing data to create order');
    }

    // Find or create customer account
    // First try to find by email
    let customer = await prisma.customer_accounts.findUnique({
      where: { CustomerEmail: customerInfo.email },
    });

    // If not found by email and phone is provided, try to find by phone
    if (!customer && customerInfo.phone) {
      customer = await prisma.customer_accounts.findUnique({
        where: { CustomerPhone: customerInfo.phone },
      });
      
      // If found by phone but email is different, update the email
      if (customer && customer.CustomerEmail !== customerInfo.email) {
        try {
          customer = await prisma.customer_accounts.update({
            where: { CustomerId: customer.CustomerId },
            data: {
              CustomerEmail: customerInfo.email,
              CustomerFullName: customerInfo.name,
              CustomerAddress: customerInfo.address || customer.CustomerAddress,
            },
          });
        } catch (error: any) {
          console.error('Error updating customer email:', error);
          // If email update fails (email might be taken), just use existing customer
          console.warn('Using existing customer with different email');
        }
      }
    }

    if (!customer) {
      // Create customer account (with placeholder password hash - customer can set password later)
      // Using a placeholder that fits Char(60) - guest accounts will set real password on first login
      // Format: GUEST_ + timestamp padded to 60 chars total
      const timestamp = Date.now().toString();
      const placeholderHash = ('GUEST_' + timestamp).padEnd(60, 'X').substring(0, 60);
      try {
        customer = await prisma.customer_accounts.create({
          data: {
            CustomerFullName: customerInfo.name,
            CustomerEmail: customerInfo.email,
            CustomerPhone: customerInfo.phone || null,
            CustomerAddress: customerInfo.address || null,
            CustomerPasswordHash: placeholderHash,
          },
        });
      } catch (error: any) {
        console.error('Error creating customer:', error);
        // If phone constraint fails, try again without phone
        if (error.code === 'P2002' && error.meta?.target?.includes('CustomerPhone')) {
          console.warn('Phone number already exists, attempting to find existing customer...');
          if (customerInfo.phone) {
            customer = await prisma.customer_accounts.findUnique({
              where: { CustomerPhone: customerInfo.phone },
            });
            if (customer) {
              // Update customer info if needed
              try {
                customer = await prisma.customer_accounts.update({
                  where: { CustomerId: customer.CustomerId },
                  data: {
                    CustomerFullName: customerInfo.name,
                    CustomerEmail: customerInfo.email,
                    CustomerAddress: customerInfo.address || customer.CustomerAddress,
                  },
                });
              } catch (updateError: any) {
                console.error('Error updating existing customer:', updateError);
                throw new Error(`Failed to update customer account: ${updateError.message}`);
              }
            } else {
              throw new Error(`Failed to create customer account: Phone number already exists but customer not found`);
            }
          } else {
            throw new Error(`Failed to create customer account: ${error.message}`);
          }
        } else {
          throw new Error(`Failed to create customer account: ${error.message}`);
        }
      }
    }

    if (!customer || !customer.CustomerId) {
      throw new Error('Customer account is invalid');
    }

    // Calculate remaining balance
    const totalAmount = total;
    const remainingBalance = paymentType === 'partial' ? totalAmount - amount : 0;

    // Create order
    // Find a fallback product_id in case any product_id is invalid
    let fallbackProduct = await prisma.catalog_clothing.findFirst({
      select: { product_id: true },
    });
    
    // If no products exist, create a placeholder product
    if (!fallbackProduct) {
      try {
        const uniqueName = `Placeholder Product ${Date.now()}`;
        fallbackProduct = await prisma.catalog_clothing.create({
          data: {
            product_name: uniqueName,
            category: 'General',
            base_price: 0,
            status: 'Active',
          },
          select: { product_id: true },
        });
      } catch (error: any) {
        console.error('Error creating placeholder product:', error);
        throw new Error('No products found in catalog and unable to create placeholder. Please add products first.');
      }
    }
    
    const fallbackProductId = fallbackProduct.product_id;

    // Prepare order items with valid product_ids
    const orderItemsData = await Promise.all(
      orderItems.map(async (item) => {
        let productId = item.productId;
        
        // Use fallback if productId is invalid (0 or falsy)
        if (!productId || productId === 0) {
          productId = fallbackProductId;
        } else {
          // Verify the product exists
          const productExists = await prisma.catalog_clothing.findUnique({
            where: { product_id: productId },
            select: { product_id: true },
          });
          
          if (!productExists) {
            productId = fallbackProductId;
          }
        }
        
        return {
          product_id: productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
          size: item.size || null,
          color: item.color || null,
          customization_data: item.customizationData || null,
        };
      })
    );

    try {
      order = await prisma.orders.create({
        data: {
          order_ref: orderId,
          customer_id: customer.CustomerId,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email.trim().toLowerCase(),
          customer_phone: customerInfo.phone || null,
          customer_address: customerInfo.address || null,
          total_amount: totalAmount,
          balance_remaining: remainingBalance,
          status: 'payment_pending',
          order_items: {
            create: orderItemsData,
          },
        },
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Order data:', {
        order_ref: orderId,
        customer_id: customer.CustomerId,
        orderItemsData,
      });
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Validate payment amount
  const totalAmount = Number(order.total_amount);
  if (paymentType === 'partial') {
    const minAmount = totalAmount * 0.5;
    if (amount < minAmount) {
      throw new Error(`Partial payment must be at least 50% of total (₱${minAmount.toFixed(2)})`);
    }
    if (amount >= totalAmount) {
      throw new Error('Partial payment amount cannot exceed total. Please use full payment.');
    }
  } else {
    if (amount !== totalAmount) {
      throw new Error('Full payment amount must match order total');
    }
  }

  // Calculate remaining balance
  const remainingBalance = paymentType === 'partial' ? totalAmount - amount : 0;

  // Create payment record
  const payment = await prisma.payments.create({
    data: {
      order_id: order.order_id,
      payment_method: 'gcash',
      payment_type: paymentType,
      payment_status: 'pending',
      amount: totalAmount,
      amount_paid: amount,
      remaining_balance: remainingBalance,
      payment_proof_url: null, // No receipt upload
      cloudinary_public_id: null, // No receipt upload
      reference_number: referenceNumber.trim(),
    },
  });

  // Update order balance
  // Always set status to 'payment_pending' until payment is approved
  await prisma.orders.update({
    where: { order_id: order.order_id },
    data: {
      balance_remaining: remainingBalance,
      payment_id: payment.payment_id,
      status: 'payment_pending', // Always payment_pending until admin approves
    },
  });

  return {
    paymentId: payment.payment_id,
    orderId: order.order_id,
    paymentType,
    amountPaid: amount,
    remainingBalance,
    paymentStatus: 'pending',
  };
}

/**
 * Get all payments with filters
 */
export async function getPayments(filters?: {
  status?: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'gcash' | 'bank_transfer' | 'cod' | 'card';
  paymentType?: 'partial' | 'full';
}) {
  const where: any = {};

  if (filters?.status) {
    where.payment_status = filters.status;
  }

  if (filters?.paymentMethod) {
    where.payment_method = filters.paymentMethod;
  }

  if (filters?.paymentType) {
    where.payment_type = filters.paymentType;
  }

  const payments = await prisma.payments.findMany({
    where,
    include: {
      orders_payments_order_idToorders: {
        include: {
          order_items: true,
        },
      },
      Users: {
        select: {
          UserId: true,
          FullName: true,
          Email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return payments.map((payment) => ({
    id: payment.payment_id.toString(),
    orderId: payment.orders_payments_order_idToorders.order_ref,
    customer: {
      name: payment.orders_payments_order_idToorders.customer_name,
      email: payment.orders_payments_order_idToorders.customer_email,
      phone: payment.orders_payments_order_idToorders.customer_phone || '',
    },
    orderSummary: {
      items: payment.orders_payments_order_idToorders.order_items
        .map((item) => `${item.product_name} x${item.quantity}`)
        .join(', '),
      total: Number(payment.orders_payments_order_idToorders.total_amount),
    },
    paymentMethod: payment.payment_method,
    paymentType: payment.payment_type || 'full',
    amountPaid: Number(payment.amount_paid || payment.amount),
    remainingBalance: Number(payment.remaining_balance || 0),
    paymentStatus: payment.payment_status || 'pending',
    receiptUrl: payment.payment_proof_url,
    referenceNumber: payment.reference_number,
    verifiedBy: payment.Users?.FullName || null,
    verifiedAt: payment.verified_at,
    submittedAt: payment.created_at,
  }));
}

/**
 * Get single payment by ID
 */
export async function getPaymentById(paymentId: number) {
  const payment = await prisma.payments.findUnique({
    where: { payment_id: paymentId },
    include: {
      orders_payments_order_idToorders: {
        include: {
          order_items: true,
        },
      },
      Users: {
        select: {
          UserId: true,
          FullName: true,
          Email: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  return {
    id: payment.payment_id.toString(),
    orderId: payment.orders_payments_order_idToorders.order_ref,
    customer: {
      name: payment.orders_payments_order_idToorders.customer_name,
      email: payment.orders_payments_order_idToorders.customer_email,
      phone: payment.orders_payments_order_idToorders.customer_phone || '',
    },
    orderSummary: {
      items: payment.orders_payments_order_idToorders.order_items
        .map((item) => `${item.product_name} x${item.quantity}`)
        .join(', '),
      total: Number(payment.orders_payments_order_idToorders.total_amount),
    },
    paymentMethod: payment.payment_method,
    paymentType: payment.payment_type || 'full',
    amountPaid: Number(payment.amount_paid || payment.amount),
    remainingBalance: Number(payment.remaining_balance || 0),
    paymentStatus: payment.payment_status || 'pending',
    receiptUrl: payment.payment_proof_url,
    referenceNumber: payment.reference_number,
    verifiedBy: payment.Users?.FullName || null,
    verifiedAt: payment.verified_at,
    submittedAt: payment.created_at,
  };
}

/**
 * Approve a payment
 */
export async function approvePayment(paymentId: number, verifiedBy: number) {
  const payment = await prisma.payments.findUnique({
    where: { payment_id: paymentId },
    include: {
      orders_payments_order_idToorders: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Update payment status
  await prisma.payments.update({
    where: { payment_id: paymentId },
    data: {
      payment_status: 'paid',
      verified_by: verifiedBy,
      verified_at: new Date(),
      paid_at: new Date(),
    },
  });

  // Update order balance and status
  const order = payment.orders_payments_order_idToorders;
  const remainingBalance = Number(payment.remaining_balance || 0);
  const amountPaid = Number(payment.amount_paid || payment.amount);
  
  await prisma.orders.update({
    where: { order_id: order.order_id },
    data: {
      balance_remaining: remainingBalance,
      status: remainingBalance > 0 ? 'payment_pending' : 'pending',
    },
  });

  // Add income entry to cashflow using cashflow service
  try {
    await cashflowService.addMoneyIn({
      description: `Order Payment - ${order.order_ref}`,
      amount: amountPaid,
      category: 'income',
      vendor: order.customer_name,
      paymentMethod: payment.payment_method,
      date: new Date(),
      referenceNumber: payment.reference_number || undefined,
    });
  } catch (error) {
    console.error('Failed to create income entry in cashflow:', error);
    // Don't throw - payment approval should still succeed even if cashflow entry fails
  }

  return {
    success: true,
    message: 'Payment approved successfully',
  };
}

/**
 * Reject a payment
 */
export async function rejectPayment(paymentId: number, verifiedBy: number) {
  const payment = await prisma.payments.findUnique({
    where: { payment_id: paymentId },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  await prisma.payments.update({
    where: { payment_id: paymentId },
    data: {
      payment_status: 'failed',
      verified_by: verifiedBy,
      verified_at: new Date(),
    },
  });

  return {
    success: true,
    message: 'Payment rejected',
  };
}

