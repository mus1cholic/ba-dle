import React from "react";

const PlayerRow = React.memo(({ row }) => {
    const { player, correctness } = row;
  
    return (
      <tr className={`bg-gray-50 ${correctness?.correct === false ? "bg-red-100" : ""}`}>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.Name.correct ? "bg-green-100" : ""
          }`}
          title={correctness?.Name.difference ? `Difference: ${correctness.Name.difference}` : ""}
        >
          {player.Name}
        </td>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.Academy.correct ? "bg-green-100" : ""
          }`}
        >
          {player.Academy}
        </td>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.Club.correct ? "bg-green-100" : ""
          }`}
        >
          {player.Club}
        </td>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.["Weapon Type"].correct ? "bg-green-100" : ""
          }`}
        >
          {player["Weapon Type"]}
        </td>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.Age.correct ? "bg-green-100" : ""
          }`}
        >
          {player.Age}
        </td>
        <td
          className={`px-4 py-2 text-center text-xs border border-gray-300 ${
            correctness?.Height.correct ? "bg-green-100" : (Math.abs(correctness?.Height.difference) <= 3 ? "bg-yellow-300" : "")
          }`}
        >
          {player.Height}cm {correctness?.Height.difference > 0 ? "↑" : (correctness?.Height.difference < 0 ? "↓" : "")}
        </td>
      </tr>
    );
  });
  
  export default PlayerRow;
  