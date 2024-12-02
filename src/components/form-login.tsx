'use client';
import { IconMail, IconLock, IconEye, IconEyeOff, IconLoader } from "@tabler/icons-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
          variant: "success",
        });

        router.push(data.redirectTo || "/home");
      } else {
        const data = await response.json();
        toast({
          title: "Erro ao fazer login",
          description: data.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="relative">
        <label className="font-medium">E-mail</label>
        <div className="relative mt-1">
          <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="relative">
        <label className="font-medium">Senha</label>
        <div className="relative mt-1">
          <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <IconLoader className="animate-spin" size={20} /> : "Login"}
      </button>

      <p className="text-center mt-6 text-gray-400">
        Não tem conta ainda?{" "}
        <a href="/registro" className="text-blue-500 font-semibold hover:underline">
          Registre-se
        </a>
      </p>
    </form>
  );
}
