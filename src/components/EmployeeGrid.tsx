import { PayrollCard } from "./PayrollCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

const mockEmployees = [
  {
    id: "1",
    name: "Sarah Chen",
    department: "Engineering",
    role: "Senior Developer",
    salary: 95000,
    nextPayday: "Feb 15, 2024",
    status: "encrypted" as const,
  },
  {
    id: "2", 
    name: "Marcus Johnson",
    department: "Marketing",
    role: "Marketing Manager", 
    salary: 75000,
    nextPayday: "Feb 15, 2024",
    status: "processing" as const,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    department: "Design",
    role: "UX Designer",
    salary: 78000,
    nextPayday: "Feb 15, 2024", 
    status: "ready" as const,
  },
  {
    id: "4",
    name: "David Kim",
    department: "Engineering",
    role: "DevOps Engineer",
    salary: 88000,
    nextPayday: "Feb 15, 2024",
    status: "encrypted" as const,
  },
  {
    id: "5",
    name: "Amy Foster",
    department: "HR",
    role: "HR Manager",
    salary: 72000,
    nextPayday: "Feb 15, 2024",
    status: "encrypted" as const,
  },
  {
    id: "6",
    name: "James Wilson",
    department: "Sales",
    role: "Sales Director",
    salary: 92000,
    nextPayday: "Feb 15, 2024",
    status: "processing" as const,
  },
];

export const EmployeeGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departments = ["all", "Engineering", "Marketing", "Design", "HR", "Sales"];
  
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const stats = {
    total: mockEmployees.length,
    encrypted: mockEmployees.filter(e => e.status === "encrypted").length,
    processing: mockEmployees.filter(e => e.status === "processing").length,
    ready: mockEmployees.filter(e => e.status === "ready").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="payroll-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-accent mr-2" />
            <span className="text-2xl font-bold text-accent">{stats.total}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Employees</p>
        </div>
        
        <div className="payroll-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-warning mr-2" />
            <span className="text-2xl font-bold text-warning">{stats.encrypted}</span>
          </div>
          <p className="text-sm text-muted-foreground">Encrypted</p>
        </div>
        
        <div className="payroll-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-warning mr-2" />
            <span className="text-2xl font-bold text-warning">{stats.processing}</span>
          </div>
          <p className="text-sm text-muted-foreground">Processing</p>
        </div>
        
        <div className="payroll-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-success mr-2" />
            <span className="text-2xl font-bold text-success">{stats.ready}</span>
          </div>
          <p className="text-sm text-muted-foreground">Ready</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface border-card-border focus:border-accent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <Badge
                key={dept}
                variant={selectedDepartment === dept ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedDepartment === dept 
                    ? "bg-accent text-accent-foreground border-accent" 
                    : "hover:border-accent hover:text-accent"
                }`}
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept === "all" ? "All Departments" : dept}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee, index) => (
          <div
            key={employee.id}
            className="animate-fade-in-neon"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PayrollCard employee={employee} />
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No employees found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};