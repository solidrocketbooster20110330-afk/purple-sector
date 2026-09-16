export default function NewsPage() {
const news = [
{
title: "Verstappen extends championship lead",
date: "Sept 16, 2026",
},
{
title: "McLaren closes gap in constructor standings",
date: "Sept 15, 2026",
},
{
title: "Singapore GP preparations underway",
date: "Sept 14, 2026",
},
{
title: "Ferrari brings new upgrade package",
date: "Sept 13, 2026",
},
];

return (
<main
style={{
minHeight: "100vh",
background: "#05071f",
color: "white",
padding: "40px",
fontFamily: "Arial",
}}
>
<h1>📰 F1 News</h1>

<div  
    style={{  
      display: "grid",  
      gap: "20px",  
      marginTop: "30px",  
    }}  
  >  
    {news.map((item, index) => (  
      <div  
        key={index}  
        style={{  
          background: "#131942",  
          border: "1px solid #2b347a",  
          borderRadius: "20px",  
          padding: "20px",  
        }}  
      >  
        <h2>{item.title}</h2>  
        <p>{item.date}</p>  
      </div>  
    ))}  
  </div>  
</main>

);
}
