import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmployeeDetails } from "./EmployeeDetails";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Calendar, 
  DollarSign,
  Shield,
  Clock
} from "lucide-react";

interface PayrollCardProps {
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
  isEncrypted?: boolean;
}

export const PayrollCard = ({ employee, isEncrypted = true }: PayrollCardProps) => {
  const [showAmount, setShowAmount] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleVisibility = () => {
    if (isEncrypted && !showAmount) {
      setIsUnlocking(true);
      // Simulate decryption process
      setTimeout(() => {
        setShowAmount(true);
        setIsUnlocking(false);
      }, 1500);
    } else {
      setShowAmount(!showAmount);
    }
  };

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
    <Card className="payroll-card group relative overflow-hidden">
      {/* Neon glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </div>
          
          <Badge className={getStatusColor(employee.status)}>
            {employee.status === 'encrypted' && <Lock className="w-3 h-3 mr-1" />}
            {employee.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
            {employee.status === 'ready' && <Unlock className="w-3 h-3 mr-1" />}
            {employee.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Department */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Shield className="w-4 h-4 mr-2" />
          {employee.department}
        </div>

        {/* Salary Section */}
        <div className="bg-surface-elevated rounded-lg p-4 border border-card-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Monthly Salary</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              className="h-6 w-6 p-0 hover:bg-accent/20"
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : showAmount ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className={`w-5 h-5 ${showAmount ? 'text-success' : 'text-muted-foreground'}`} />
            <span className={`text-xl font-bold ${showAmount ? 'neon-green' : ''}`}>
              {showAmount ? formatSalary(employee.salary) : '██████'}
            </span>
          </div>
          
          {isEncrypted && !showAmount && (
            <p className="text-xs text-accent mt-2 flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              FHE Encrypted
            </p>
          )}
        </div>

        {/* Next Payday */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Next Payday
          </div>
          <span className="font-medium text-accent">{employee.nextPayday}</span>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4 border-accent/50 hover:border-accent hover:bg-accent/10 text-accent"
          onClick={() => setShowDetails(true)}
        >
          View Details
        </Button>

      {/* Employee Details Modal */}
      <EmployeeDetails
        employee={employee}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
      </CardContent>
    </Card>
  );
};