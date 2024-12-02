import FormRegistro from "@/components/form-registro";

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen">
      
      <div className="hidden lg:flex w-1/2 bg-gray-100">
        <video
          src="/video.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center bg-gray-900 text-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Vamos começar! Cadastre-se abaixo
          </h2>
          <FormRegistro/>
        </div>
      </div>
    </div>
  );
}
