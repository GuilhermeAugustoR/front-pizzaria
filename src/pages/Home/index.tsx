import { useNavigate } from "react-router";

// type Props = {}
const menu = [
  {
    name: "Mesa 1",
    navigation: "",
  },
  {
    name: "Mesa 2",
    navigation: "",
  },
  {
    name: "Mesa 3",
    navigation: "",
  },
  {
    name: "Mesa 4",
    navigation: "",
  },
  {
    name: "Mesa 5",
    navigation: "",
  },
  {
    name: "Mesa 6",
    navigation: "",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-col h-screen justify-center items-center">
        <div className="flex flex-col">
          <span className="text-xl mb-5">Ultimos pedidos</span>
          <div className="flex flex-col w-fit gap-6 h-[36rem] overflow-x-auto">
            {menu.map(({ name, navigation }, index) => (
              <div key={index}>
                <div
                  className="flex flex-col w-[45rem] h-14 border-2 border-indigo-400 rounded-xl 
                justify-center pl-5 shadow-lg"
                  onClick={() => navigate(navigation)}
                >
                  <span className="text-lg text-indigo-900">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
