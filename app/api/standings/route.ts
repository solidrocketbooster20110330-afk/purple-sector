export async function GET() {
  return Response.json([
    { position: 1, number: 1, name: "Max Verstappen", points: 412 },
    { position: 2, number: 4, name: "Lando Norris", points: 387 },
    { position: 3, number: 63, name: "George Russell", points: 301 },
    { position: 4, number: 16, name: "Charles Leclerc", points: 287 },
    { position: 5, number: 81, name: "Oscar Piastri", points: 271 }
  ]);
}
