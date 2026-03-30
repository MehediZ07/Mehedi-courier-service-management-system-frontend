import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Visit {
  id: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  page?: string;
  createdAt: string;
}

interface RecentVisitsTableProps {
  visits: Visit[];
}

export function RecentVisitsTable({ visits }: RecentVisitsTableProps) {
  const displayVisits = visits.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Visits (Last 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayVisits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  {visit.userName ? (
                    <div>
                      <div className="font-medium">{visit.userName}</div>
                      <div className="text-xs text-muted-foreground">{visit.userEmail}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Guest</span>
                  )}
                </TableCell>
                <TableCell>
                  {visit.userRole ? (
                    <Badge variant="outline">{visit.userRole}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{visit.page || "/"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{visit.ip}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(visit.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
