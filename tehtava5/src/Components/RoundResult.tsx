

interface Player {
  codename: string;
  guess: number;
}

interface RoundResultProps {
  players: Player[];
  correctPrice: number;
}

export function RoundResult({ players, correctPrice }: RoundResultProps) {

  const sortedPlayers = [...players].sort((a, b) => {
    const diffA = Math.abs(a.guess - correctPrice);
    const diffB = Math.abs(b.guess - correctPrice);
    return diffA - diffB;
  });

  return (
    <div className="round-result">
      <h3>Kierros päättyi!</h3>
      <p className="correct-price">Oikea hinta oli: <strong>{correctPrice} €</strong></p>

      <table className="result-table">
        <thead>
          <tr>
            <th>Pelaaja</th>
            <th>Arvaus</th>
            <th>Ero</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => {
            const difference = Math.abs(player.guess - correctPrice);
            return (
              <tr key={player.codename} className="result-row">
                <td>{player.codename}</td>
                <td>{player.guess} €</td>
                <td>{difference.toFixed(2)} €</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}