import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Clock,
  FileText,
  Download
} from "lucide-react";

interface EmployeeDetailsProps {
  employee: {
    id: string;
    name: string;
    department: string;
    role: string;
    salary: number;
    nextPayday: string;
    status: "encrypted" | "processing" | "ready";
    avatar?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDetails = ({ employee, open, onOpenChange }: EmployeeDetailsProps) => {
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'encrypted': return 'text-accent border-accent bg-accent/10';
      case 'processing': return 'text-warning border-warning bg-warning/10';
      case 'ready': return 'text-success border-success bg-success/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-surface-elevated border-card-border">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <DialogTitle className="text-xl">{employee.name}</DialogTitle>
              <p className="text-muted-foreground">{employee.role}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <Badge className={getStatusColor(employee.status)}>
              {employee.status.toUpperCase()}
            </Badge>
          </div>

          <Separator />

          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Employee Information</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono">{employee.id}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dept:</span>
                <span>{employee.department}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="text-accent">{employee.name.toLowerCase().replace(' ', '.')}@company.com</span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span>+1 (555) 0123</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payroll Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Payroll Information</h3>
            
            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Monthly Salary:</span>
                </div>
                <span className="font-bold text-success neon-green">
                  {formatSalary(employee.salary)}
                </span>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">Next Payday:</span>
                </div>
                <span className="font-medium text-accent">{employee.nextPayday}</span>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pay Frequency:</span>
                </div>
                <span>Monthly</span>

                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tax Status:</span>
                </div>
                <span>W-2 Employee</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1 border-accent/50 hover:border-accent hover:bg-accent/10 text-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Paystub
            </Button>
            <Button 
              className="flex-1 corporate-gradient hover:shadow-lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};