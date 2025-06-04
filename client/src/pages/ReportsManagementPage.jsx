import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Flag,
  User,
  MessageSquare,
  Eye,
  Ban,
  CheckCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_REPORTS = [
  {
    id: "RPT001",
    reporterId: "user1",
    reporterName: "John Doe",
    reportedUserId: "user2",
    reportedUserName: "Jane Smith",
    reportedItemId: "item123",
    reportedItemName: "MacBook Pro 2020",
    reason: "fraud",
    description:
      "User is selling a fake MacBook. The serial number doesn't match Apple's database.",
    timestamp: "2024-01-15T10:30:00Z",
    status: "pending",
    priority: "high",
  },
  {
    id: "RPT002",
    reporterId: "user3",
    reporterName: "Mike Johnson",
    reportedUserId: "user4",
    reportedUserName: "Sarah Wilson",
    reportedItemId: null,
    reportedItemName: null,
    reason: "harassment",
    description:
      "User has been sending inappropriate messages and harassing other members.",
    timestamp: "2024-01-14T15:45:00Z",
    status: "investigating",
    priority: "high",
  },
  {
    id: "RPT003",
    reporterId: "user5",
    reporterName: "Emily Davis",
    reportedUserId: "user6",
    reportedUserName: "Tom Brown",
    reportedItemId: "item456",
    reportedItemName: "Chemistry Textbook",
    reason: "spam",
    description:
      "User keeps posting the same item multiple times across different categories.",
    timestamp: "2024-01-13T09:15:00Z",
    status: "resolved",
    priority: "medium",
    resolution: "Warning issued to user. Duplicate posts removed.",
  },
];

const REASON_ICONS = {
  fraud: <AlertTriangle className="h-4 w-4" />,
  inappropriate: <Flag className="h-4 w-4" />,
  spam: <MessageSquare className="h-4 w-4" />,
  harassment: <User className="h-4 w-4" />,
  safety: <Shield className="h-4 w-4" />,
  other: <Flag className="h-4 w-4" />,
};

const REASON_LABELS = {
  fraud: "Fraudulent Activity",
  inappropriate: "Inappropriate Content",
  spam: "Spam or Duplicate Posts",
  harassment: "Harassment or Abuse",
  safety: "Safety Concerns",
  other: "Other",
};

export default function ReportsManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filteredReports, setFilteredReports] = useState(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = [...reports];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.reporterName.toLowerCase().includes(query) ||
          report.reportedUserName.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.priority === priorityFilter
      );
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter, priorityFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: "destructive",
      investigating: "default",
      resolved: "secondary",
    };
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return (
      <Badge variant={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleAction = (type) => {
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      // Here you would make API calls to execute the action
      const actionData = {
        reportId: selectedReport.id,
        action: actionType,
        notes: actionNotes,
        adminId: user.id,
        timestamp: new Date().toISOString(),
      };

      console.log("Executing action:", actionData);

      // Update report status
      const updatedReports = reports.map((report) =>
        report.id === selectedReport.id
          ? {
              ...report,
              status: actionType === "dismiss" ? "resolved" : "resolved",
              resolution: actionNotes || `${actionType} action taken by admin`,
            }
          : report
      );

      setReports(updatedReports);
      toast.success(`Action "${actionType}" executed successfully`);

      setIsActionDialogOpen(false);
      setIsDetailsOpen(false);
      setActionNotes("");
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error("Failed to execute action");
    }
  };

  const getReportStats = () => {
    const pending = reports.filter((r) => r.status === "pending").length;
    const investigating = reports.filter(
      (r) => r.status === "investigating"
    ).length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const highPriority = reports.filter((r) => r.priority === "high").length;

    return { pending, investigating, resolved, highPriority };
  };

  const stats = getReportStats();

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage user reports and violations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.investigating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriority}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {report.id}
                    </span>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                    <div className="flex items-center gap-1">
                      {REASON_ICONS[report.reason]}
                      <span className="text-sm">
                        {REASON_LABELS[report.reason]}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Reported User
                      </p>
                      <p className="font-medium">{report.reportedUserName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Reported By
                      </p>
                      <p className="font-medium">{report.reporterName}</p>
                    </div>
                    {report.reportedItemName && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Related Item
                        </p>
                        <p className="font-medium">{report.reportedItemName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(report)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
          <p className="text-muted-foreground">
            No reports match your current filters.
          </p>
        </div>
      )}

      {/* Report Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Report Details - {selectedReport.id}
                </DialogTitle>
                <DialogDescription>
                  Review the report details and take appropriate action.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedReport.priority)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {REASON_ICONS[selectedReport.reason]}
                    <span>{REASON_LABELS[selectedReport.reason]}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Reported User</Label>
                    <p className="mt-1">{selectedReport.reportedUserName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reported By</Label>
                    <p className="mt-1">{selectedReport.reporterName}</p>
                  </div>
                </div>

                {selectedReport.reportedItemName && (
                  <div>
                    <Label className="text-sm font-medium">Related Item</Label>
                    <p className="mt-1">{selectedReport.reportedItemName}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Date Reported</Label>
                  <p className="mt-1">
                    {new Date(selectedReport.timestamp).toLocaleString()}
                  </p>
                </div>

                {selectedReport.resolution && (
                  <div>
                    <Label className="text-sm font-medium">Resolution</Label>
                    <p className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                      {selectedReport.resolution}
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.status !== "resolved" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleAction("dismiss")}
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction("warn")}
                  >
                    Warn User
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction("ban")}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this user? Please provide
              additional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add notes about this action..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              variant={actionType === "ban" ? "destructive" : "default"}
            >
              Confirm {actionType}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
