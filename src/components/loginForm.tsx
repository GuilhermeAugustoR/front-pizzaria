import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLogin } from "@/services/Login/loginService";
import { LoginContext } from "@/context/loginContext";
import { useNavigate } from "react-router";

// interface LoginFormProps {
//   onSubmit: (email: string, password: string) => Promise<void>;
// }

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser, setToken, error, isLoading, setError, setIsLoading } =
    useContext(LoginContext);
  const [email, setEmail] = useState("guilherme@teste.com");
  const [password, setPassword] = useState("123456");

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await AuthLogin({ email, password });

      if (response.status === 400) {
        console.log("aqui", response);
        setError(response.response.data.error);
        setIsLoading(false);
        return;
      }

      setUser({
        id: response?.id,
        name: response.name,
        email: response.email,
      });

      console.log("aaa", response);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      window.location.replace("/home");
      navigate("/home");
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome to Our Platform</CardTitle>
        <CardDescription>
          Enter your details to access your account
        </CardDescription>
      </CardHeader> */}
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="#" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </CardFooter>
    </div>
  );
}
