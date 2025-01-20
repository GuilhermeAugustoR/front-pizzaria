import LoginForm from "@/components/loginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl h-[30rem] w-full flex flex-col sm:flex-row">
        <div className="sm:w-1/2 hidden sm:block relative">
          {/* <img
            src="/placeholder.svg?height=600&width=600"
            alt="Login illustration"
            width={600}
            height={600}
            className="object-cover w-full h-full"
          /> */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-indigo-500/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center">
              Welcome to Dev Pizzaria
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center sm:w-1/2 p-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
