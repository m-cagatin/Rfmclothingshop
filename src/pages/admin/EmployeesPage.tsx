import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Dela Cruz',
    email: 'john.delacruz@rfm.com',
    phone: '09123456789',
    role: 'Production Manager',
    department: 'Production',
    status: 'active',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@rfm.com',
    phone: '09234567890',
    role: 'Designer',
    department: 'Design',
    status: 'active',
    joinDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Pedro Garcia',
    email: 'pedro.garcia@rfm.com',
    phone: '09345678901',
    role: 'Quality Control',
    department: 'Production',
    status: 'active',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Ana Reyes',
    email: 'ana.reyes@rfm.com',
    phone: '09456789012',
    role: 'Customer Service',
    department: 'Support',
    status: 'active',
    joinDate: '2023-04-05',
  },
  {
    id: '5',
    name: 'Carlos Ramos',
    email: 'carlos.ramos@rfm.com',
    phone: '09567890123',
    role: 'Warehouse Staff',
    department: 'Logistics',
    status: 'inactive',
    joinDate: '2023-05-12',
  },
];

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Employees</h1>
            <p className="text-gray-600">Manage your team members and staff</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="size-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
