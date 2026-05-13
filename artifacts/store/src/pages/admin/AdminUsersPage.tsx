import { Users } from "lucide-react";
import { useListAllUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminUsersPage() {
  const { data: users, isLoading } = useListAllUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><Users className="h-6 w-6 text-primary" /> All Users</h1>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><Skeleton className="h-64" /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="text-muted-foreground text-sm">#{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!users?.length && <div className="text-center py-12 text-muted-foreground">No users found</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
