import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Missing login code");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Verification failed");
        }
        if (cancelled) return;
        await signInWithCustomToken(auth, data.token);
        navigate("/my-cards", { replace: true });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Login failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>
            {error}
            <p className="mt-2">
              <Link to="/login" className="underline">
                Back to login
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <p className="text-sm text-muted-foreground">
            Completing sign-in with Abakus...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
