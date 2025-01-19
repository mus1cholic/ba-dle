import PlayerRow from "./PlayerRow";

const PlayerTable = ({ rows }) => {
  if (rows.length === 0) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-300 border border-gray-300">
            <th className="px-4 py-2 border border-gray-300">Name</th>
            <th className="px-4 py-2 border border-gray-300">Academy</th>
            <th className="px-4 py-2 border border-gray-300">Club</th>
            <th className="px-4 py-2 border border-gray-300">Weapon Type</th>
            <th className="px-4 py-2 border border-gray-300">Age</th>
            <th className="px-4 py-2 border border-gray-300">Height</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <PlayerRow key={index} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
