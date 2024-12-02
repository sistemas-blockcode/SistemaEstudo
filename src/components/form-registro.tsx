'use client'

import { IconMail, IconLock, IconEye, IconEyeOff, IconUser, IconId } from "@tabler/icons-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function FormRegistro() {
  const [fullName, setFullName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: fullName,
          matricula: registrationNumber,
          email,
          senha: password,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário registrado com sucesso!",
          variant: "success",
        });
        router.push("/login");
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao registrar o usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao tentar registrar o usuário.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Campo Nome Completo */}
      <div className="relative">
        <label className="font-medium">Nome Completo</label>
        <div className="relative mt-1">
          <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Campo Matrícula */}
      <div className="relative">
        <label className="font-medium">Matrícula</label>
        <div className="relative mt-1">
          <IconId className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Digite sua matrícula"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Campo E-mail */}
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

      {/* Campo Senha */}
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
        className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2"
      >
        Registrar
      </button>

      <p className="text-center mt-6 text-gray-400">
        Já tem uma conta?{" "}
        <a href="/login" className="text-blue-500 font-semibold hover:underline">
          Faça login
        </a>
      </p>
    </form>
  );
}
