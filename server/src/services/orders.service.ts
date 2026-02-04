import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tracking event helper function
async function addTrackingEvent(
  orderId: number,
  status: string,
  message: string,
  location?: string | null
) {
  try {
    await prisma.tracking_events.create({
      data: {
        order_id: orderId,
        status,
        message,
        location: location || null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error adding tracking event:', error);
    // Don't throw - tracking events are nice-to-have, not critical
  }
}

// Status message templates (Shopee-style)
const statusMessages: Record<string, { message: string; location?: string }> = {
  payment_pending: { message: 'Order placed - Waiting for payment confirmation' },
  pending: { message: 'Order confirmed and ready for production' },
  designing: { message: 'Design team is working on your custom design', location: 'Design Department' },
  ripping: { message: 'Preparing fabric and materials for printing', location: 'Ripping Station' },
  heatpress: { message: 'Applying heat transfer to fabric', location: 'Heat Press Station' },
  assembly: { message: 'Assembling and sewing garment pieces together', location: 'Assembly Line' },
  qa: { message: 'Quality assurance in progress - Inspecting final product', location: 'QA Department' },
  packing: { message: 'Packing your order for shipment', location: 'Packing Station' },
  done: { message: 'Production complete - Preparing to ship your parcel', location: 'Warehouse' },
  shipping: { message: 'Parcel picked up by logistics partner - In transit' },
  delivered: { message: 'Order delivered successfully' },
  cancelled: { message: 'Order has been cancelled' },
};

/**
 * Get all orders with optional status filter
 */
export async function getAllOrders(filters?: {
  status?: string;
  customerEmail?: string;
}) {
  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerEmail) {
      // Normalize email for matching (trim and lowercase)
      const normalizedEmail = filters.customerEmail.trim().toLowerCase();
      where.customer_email = normalizedEmail;
    }

    const orders = await prisma.orders.findMany({
      where,
      include: {
        order_items: {
          include: {
            catalog_clothing: {
              include: {
                product_images: {
                  orderBy: {
                    display_order: 'asc',
                  },
                  take: 1, // Get first image
                },
              },
            },
          },
        },
        tracking_events: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        payments_payments_order_idToorders: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1, // Get latest payment
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

  return orders.map((order) => ({
    id: order.order_ref,
    orderId: order.order_id,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone || '',
      address: order.customer_address || '',
    },
    items: order.order_items.map((item) => {
      // Try to get image from multiple sources:
      // 1. First check if image_url is stored in order_items (new field)
      // 2. Then check product_images relation
      let imageUrl = null;
      try {
        // Check if image_url is stored directly in order_items
        if ((item as any).image_url) {
          imageUrl = (item as any).image_url;
        } 
        // Fallback to product_images relation
        else if (item.catalog_clothing?.product_images && item.catalog_clothing.product_images.length > 0) {
          imageUrl = item.catalog_clothing.product_images[0].image_url;
        }
      } catch (error) {
        console.error(`❌ Failed to get image for product ${item.product_id}:`, error);
      }
      
      return {
        id: item.item_id.toString(),
        productId: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        image: imageUrl,
      };
    }),
    total: Number(order.total_amount),
    balanceRemaining: Number(order.balance_remaining || 0),
    status: order.status || 'payment_pending',
    orderDate: order.order_date,
    estimatedCompletion: order.estimated_completion,
    notes: order.notes,
    payment: order.payments_payments_order_idToorders[0] ? {
      id: order.payments_payments_order_idToorders[0].payment_id,
      method: order.payments_payments_order_idToorders[0].payment_method,
      status: order.payments_payments_order_idToorders[0].payment_status,
      type: order.payments_payments_order_idToorders[0].payment_type,
      amountPaid: Number(order.payments_payments_order_idToorders[0].amount_paid || order.payments_payments_order_idToorders[0].amount),
      amount: Number(order.payments_payments_order_idToorders[0].amount),
      remainingBalance: Number(order.payments_payments_order_idToorders[0].remaining_balance || 0),
      referenceNumber: order.payments_payments_order_idToorders[0].reference_number,
      createdAt: order.payments_payments_order_idToorders[0].created_at,
      verifiedAt: order.payments_payments_order_idToorders[0].verified_at,
      paidAt: order.payments_payments_order_idToorders[0].paid_at,
    } : null,
    trackingEvents: order.tracking_events.map((event) => ({
      id: event.id,
      status: event.status,
      message: event.message,
      location: event.location,
      timestamp: event.timestamp,
    })),
    shipping: {
      trackingNumber: (order as any).tracking_number || null,
      carrier: (order as any).carrier || null,
      shippedDate: (order as any).shipped_date || null,
      estimatedDelivery: (order as any).estimated_delivery || null,
    },
  }));
  } catch (error: any) {
    console.error('Error in getAllOrders:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    throw error;
  }
}

/**
 * Get order by order_ref
 */
export async function getOrderByRef(orderRef: string) {
  const order = await prisma.orders.findUnique({
    where: { order_ref: orderRef },
    include: {
      order_items: {
        include: {
          catalog_clothing: {
            include: {
              product_images: {
                orderBy: {
                  display_order: 'asc',
                },
                take: 1, // Get first image
              },
            },
          },
        },
      },
      tracking_events: {
        orderBy: {
          timestamp: 'desc',
        },
      },
      payments_payments_order_idToorders: {
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  // Get latest payment (most recent)
  const latestPayment = order.payments_payments_order_idToorders.length > 0
    ? order.payments_payments_order_idToorders[0]
    : null;

  return {
    id: order.order_ref,
    orderId: order.order_id,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone || '',
      address: order.customer_address || '',
    },
    items: order.order_items.map((item) => {
      // Try to get image from multiple sources:
      // 1. First check if image_url is stored in order_items (new field)
      // 2. Then check product_images relation
      let imageUrl = null;
      try {
        // Check if image_url is stored directly in order_items
        if ((item as any).image_url) {
          imageUrl = (item as any).image_url;
        } 
        // Fallback to product_images relation
        else if (item.catalog_clothing?.product_images && item.catalog_clothing.product_images.length > 0) {
          imageUrl = item.catalog_clothing.product_images[0].image_url;
        }
      } catch (error) {
        console.error(`❌ Failed to get image for product ${item.product_id}:`, error);
      }
      
      return {
        id: item.item_id.toString(),
        productId: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        image: imageUrl,
      };
    }),
    total: Number(order.total_amount),
    balanceRemaining: Number(order.balance_remaining || 0),
    status: order.status || 'payment_pending',
    orderDate: order.order_date,
    estimatedCompletion: order.estimated_completion,
    notes: order.notes,
    trackingEvents: order.tracking_events.map((event) => ({
      id: event.id,
      status: event.status,
      message: event.message,
      location: event.location,
      timestamp: event.timestamp,
    })),
    shipping: {
      trackingNumber: (order as any).tracking_number || null,
      carrier: (order as any).carrier || null,
      shippedDate: (order as any).shipped_date || null,
      estimatedDelivery: (order as any).estimated_delivery || null,
    },
    payment: latestPayment ? {
      id: latestPayment.payment_id,
      method: latestPayment.payment_method,
      status: latestPayment.payment_status,
      type: latestPayment.payment_type,
      amountPaid: Number(latestPayment.amount_paid || latestPayment.amount),
      amount: Number(latestPayment.amount),
      remainingBalance: Number(latestPayment.remaining_balance || 0),
      referenceNumber: latestPayment.reference_number,
      createdAt: latestPayment.created_at,
      verifiedAt: latestPayment.verified_at,
      paidAt: latestPayment.paid_at,
    } : null,
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: number, status: string) {
  // Validate status - only allow valid enum values from Prisma schema
  // These must match the orders_status enum exactly
  const validStatuses = [
    'payment_pending',
    'pending',
    'designing',
    'ripping',
    'heatpress',
    'assembly',
    'qa',
    'packing',
    'done',
    'shipping',
    'delivered',
    'cancelled',
  ];

  // Normalize status to lowercase and trim whitespace
  const normalizedStatus = status.trim().toLowerCase();

  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error(`Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`);
  }

  // Log the status update for debugging
  console.log(`Updating order ${orderId} status to: "${normalizedStatus}"`);

  // Use raw query to update status to avoid enum type issues
  // This allows us to use the status string directly without Prisma enum validation
  try {
    // First, try with Prisma update using type assertion
    // Use normalizedStatus to ensure consistency
    const order = await prisma.orders.update({
      where: { order_id: orderId },
      data: {
        status: normalizedStatus as any,
        updated_at: new Date(),
      },
      include: {
        order_items: true,
      },
    });

    // Add tracking event for status change
    const statusInfo = statusMessages[normalizedStatus];
    if (statusInfo) {
      await addTrackingEvent(
        orderId,
        normalizedStatus,
        statusInfo.message,
        statusInfo.location
      );
    }
    
    // Auto-generate shipping details when status is set to "shipping"
    if (normalizedStatus === 'shipping') {
      try {
        const existingOrder = await prisma.orders.findUnique({
          where: { order_id: orderId },
        });
        
        // Check if shipping details already exist (check if tracking_number is null)
        const hasShippingDetails = (existingOrder as any)?.tracking_number !== null && 
                                   (existingOrder as any)?.tracking_number !== undefined;
        
        if (!hasShippingDetails) {
          // Generate mock shipping details
          const carriers = ['J&T Express', 'LBC', '2GO', 'Lalamove', 'Grab Express'];
          const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
          const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          const shippedDate = new Date();
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 3); // 3-7 days
          
          // Update shipping details using MySQL syntax
          await prisma.$executeRawUnsafe(
            `UPDATE orders SET tracking_number = ?, carrier = ?, shipped_date = ?, estimated_delivery = ?, updated_at = ? WHERE order_id = ?`,
            trackingNumber,
            randomCarrier,
            shippedDate,
            estimatedDelivery,
            new Date(),
            orderId
          );
        }
      } catch (shippingError: any) {
        // Log but don't fail the status update if shipping details update fails
        console.warn('Failed to auto-generate shipping details:', shippingError.message);
      }
    }
    
    return {
      id: order.order_ref,
      orderId: order.order_id,
      status: order.status,
      updatedAt: order.updated_at,
    };
  } catch (error: any) {
    // If Prisma enum validation fails, try raw query as fallback
    if (error.message && error.message.includes('Expected orders_status')) {
      console.warn(`Prisma enum validation failed for status "${status}", trying raw query...`);
      
      // Use raw SQL query to update the status (bypassing Prisma enum validation)
      // MySQL uses ? placeholders, not $1, $2
      // Use normalizedStatus to ensure we're setting the correct status value
      await prisma.$executeRawUnsafe(
        `UPDATE orders SET status = ?, updated_at = ? WHERE order_id = ?`,
        normalizedStatus, // Use normalized status - ensure it's exactly what we validated
        new Date(),
        orderId
      );
      
      // Only generate shipping details if status is explicitly "shipping"
      // Since "shipping" is not a valid enum value, this should not execute for valid statuses like "designing"
      // IMPORTANT: Check normalizedStatus, not the original status parameter
      if (normalizedStatus === 'shipping') {
        try {
          const existingOrder = await prisma.orders.findUnique({
            where: { order_id: orderId },
          });
          
          const hasShippingDetails = (existingOrder as any)?.tracking_number !== null && 
                                     (existingOrder as any)?.tracking_number !== undefined;
          
          if (!hasShippingDetails) {
            const carriers = ['J&T Express', 'LBC', '2GO', 'Lalamove', 'Grab Express'];
            const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
            const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            const shippedDate = new Date();
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 3);
            
            await prisma.$executeRawUnsafe(
              `UPDATE orders SET tracking_number = ?, carrier = ?, shipped_date = ?, estimated_delivery = ?, updated_at = ? WHERE order_id = ?`,
              trackingNumber,
              randomCarrier,
              shippedDate,
              estimatedDelivery,
              new Date(),
              orderId
            );
          }
        } catch (shippingError: any) {
          console.warn('Failed to auto-generate shipping details:', shippingError.message);
        }
      }
      
      // Fetch the updated order
      const order = await prisma.orders.findUnique({
        where: { order_id: orderId },
        include: {
          order_items: true,
        },
      });
      
      if (!order) {
        throw new Error('Order not found after update');
      }
      
      return {
        id: order.order_ref,
        orderId: order.order_id,
        status: order.status,
        updatedAt: order.updated_at,
      };
    }
    
    // Re-throw if it's a different error
    throw error;
  }
}

/**
 * Update shipping details
 */
export async function updateShippingDetails(
  orderId: number,
  shipping: {
    trackingNumber?: string | null;
    carrier?: string | null;
    shippedDate?: Date | null;
    estimatedDelivery?: Date | null;
  }
) {
  const order = await prisma.orders.findUnique({
    where: { order_id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Update shipping details using raw query (fields may not exist in schema yet)
  // MySQL uses ? placeholders instead of $1, $2
  const updates: string[] = [];
  const values: any[] = [];

  if (shipping.trackingNumber !== undefined) {
    updates.push(`tracking_number = ?`);
    values.push(shipping.trackingNumber);
  }
  if (shipping.carrier !== undefined) {
    updates.push(`carrier = ?`);
    values.push(shipping.carrier);
  }
  if (shipping.shippedDate !== undefined) {
    updates.push(`shipped_date = ?`);
    values.push(shipping.shippedDate);
  }
  if (shipping.estimatedDelivery !== undefined) {
    updates.push(`estimated_delivery = ?`);
    values.push(shipping.estimatedDelivery);
  }

  if (updates.length > 0) {
    // If tracking number and carrier are provided, automatically set status to shipping
    if (shipping.trackingNumber && shipping.carrier && order.status !== 'shipping') {
      updates.push(`status = ?`);
      values.push('shipping');
      
      // Add tracking event for shipping
      await addTrackingEvent(
        orderId,
        'shipping',
        `Parcel picked up by ${shipping.carrier} - Tracking number: ${shipping.trackingNumber}`,
        'Logistics Center'
      );
    }
    
    updates.push(`updated_at = ?`);
    values.push(new Date());
    values.push(orderId);

    await prisma.$executeRawUnsafe(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
      ...values
    );
  }

  // Fetch updated order
  const updatedOrder = await prisma.orders.findUnique({
    where: { order_id: orderId },
    include: {
      order_items: true,
    },
  });

  if (!updatedOrder) {
    throw new Error('Order not found after update');
  }

  return {
    id: updatedOrder.order_ref,
    orderId: updatedOrder.order_id,
    status: updatedOrder.status,
    shipping: {
      trackingNumber: (updatedOrder as any).tracking_number || null,
      carrier: (updatedOrder as any).carrier || null,
      shippedDate: (updatedOrder as any).shipped_date || null,
      estimatedDelivery: (updatedOrder as any).estimated_delivery || null,
    },
  };
}

/**
 * Clear all orders (for testing)
 */
export async function clearAllOrders() {
  // Delete order items first (foreign key constraint)
  const deletedOrderItems = await prisma.order_items.deleteMany({});
  
  // Update orders to remove payment references
  await prisma.orders.updateMany({
    data: {
      payment_id: null,
    },
  });
  
  // Update payments to remove foreign key references
  await prisma.payments.updateMany({
    data: {
      verified_by: null,
    },
  });
  
  // Delete orders
  const deletedOrders = await prisma.orders.deleteMany({});
  
  // Delete payments
  const deletedPayments = await prisma.payments.deleteMany({});
  
  return {
    ordersDeleted: deletedOrders.count,
    orderItemsDeleted: deletedOrderItems.count,
    paymentsDeleted: deletedPayments.count,
  };
}

