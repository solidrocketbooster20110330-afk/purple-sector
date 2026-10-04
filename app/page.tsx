import BottomNav from "./components/BottomNav";
import NextSessionCountdown from "./components/NextSessionCountdown";

type DriverStanding = {
  position: string;
  points: string;
  Driver: { givenName: string; familyName: string };
};

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

type Session = {
  date?: string;
  time?: string;
};

type Race = {
  raceName: string;
  date: string;
  time?: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
  Qualifying?: Session;
};

type NewsItem = { title: string; link: string };

const SearchBar = () => (
  <a href="/search" style={{display:"flex",alignItems:"center",gap:"10px",background:"#11152f",border:"1px solid #2b347a",borderRadius:"16px",padding:"13px 15px",marginBottom:"14px",color:"#c7cbff",textDecoration:"none",fontSize:"15px"}}>
    <span style={{fontSize:"19px"}}>🔎</span>
    <span>Search drivers, teams, or Grands Prix</span>
  </a>
);

export default async function HomePage(){return (<main><SearchBar /></main>)}