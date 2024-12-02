'use client'
import { useState, useEffect } from "react";

export default function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const currentHour = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    });
    const hour = parseInt(currentHour, 10);

    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia, seja bem-vindo!");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde, seja bem-vindo!");
    } else {
      setGreeting("Boa noite, seja bem-vindo!");
    }
  }, []);

  return (
    <>{greeting}</>
  );
}
