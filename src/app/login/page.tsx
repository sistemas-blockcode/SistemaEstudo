import FormLogin from "@/components/form-login";
import Greeting from "@/components/greeting";

export default function LoginPage() {
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
          <h2 className="text-center font-semibold mb-3 text-lg text-gray-400">Seu estudo organizado em um único lugar.</h2>
          <h2 className="text-3xl font-semibold text-center mb-8">
            <Greeting/>
          </h2>
          <FormLogin/>
        </div>
        <p className="text-center mt-14 font-bold text-gray-400">Feito por: Luiz Nunes</p>

      </div>
    </div>
  );
}
