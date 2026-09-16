export async function GET() {
  return Response.json([
    { position: 1, team: "McLaren", points: 658 },
    { position: 2, team: "Red Bull Racing", points: 602 },
    { position: 3, team: "Mercedes", points: 519 },
    { position: 4, team: "Ferrari", points: 487 },
    { position: 5, team: "Aston Martin", points: 211 }
  ]);
}
