"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Settings, Bell, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        Access Denied. Please sign in.
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="container-custom py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-secondary">
              {user.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center justify-center text-muted-foreground gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Preferences & Settings Placeholder */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Manage your email alerts</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Security</p>
                    <p className="text-sm text-muted-foreground">Password and authentication</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-2xl font-bold text-primary">Active</p>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-2xl font-bold text-primary">Free</p>
                  <p className="text-sm text-muted-foreground">Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
