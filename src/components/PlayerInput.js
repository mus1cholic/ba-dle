import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import PlayerTable from "./PlayerTable";

const InputField = ({ inputValue, handleInputChange, handleSubmit, inputRef }) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        ref={inputRef}
        placeholder="Type a student's name here!"
        value={inputValue}
        onChange={handleInputChange}
        className="border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-50vw"
      />
    </form>
  );
};

const SuggestionList = ({ suggestions, handleSuggestionClick, highlightedIndex, inputWidth }) => {
  return (
    <ul
      className="absolute left-0 mt-2 bg-white shadow-lg rounded-lg z-50"
      style={{
        width: `${inputWidth}px`,
      }}
    >
      {suggestions.map((player, index) => (
        <li
          key={index}
          className={`p-2 cursor-pointer border-b last:border-b-0 ${
            index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => handleSuggestionClick(player)}
        >
          {player.Name}
        </li>
      ))}
    </ul>
  );
};

// const PlayerTable = ({ rows, correctData }) => {
//     if (rows.length === 0) return null;

//     return (
//       <div className="mt-6 overflow-x-auto">
//         <table className="table-auto w-full">
//           <thead>
//             <tr className="bg-gray-300 border border-gray-300">
//               <th className="px-4 py-2 border border-gray-300">Name</th>
//               <th className="px-4 py-2 border border-gray-300">Academy</th>
//               <th className="px-4 py-2 border border-gray-300">Club</th>
//               <th className="px-4 py-2 border border-gray-300">Weapon Type</th>
//               <th className="px-4 py-2 border border-gray-300">Age</th>
//               <th className="px-4 py-2 border border-gray-300">Height</th>
//             </tr>
//           </thead>
//           <tbody className="">
//             {rows.map((row, index) => (
//               <tr key={index} className="bg-gray-50">
//                 <td className={`px-4 py-2 text-center text-xs border border-gray-300`}>{row.Name}</td>
//                 <td className={`px-4 py-2 text-center text-xs border border-gray-300
//                                 ${row.Academy === correctData.Academy ? "bg-green-600" : ""}`}>
//                     {row.Academy}
//                 </td>
//                 <td className="px-4 py-2 text-center text-xs border border-gray-300">{row.Club}</td>
//                 <td className="px-4 py-2 text-center text-xs border border-gray-300">{row["Weapon Type"]}</td>
//                 <td className="px-4 py-2 text-center text-xs border border-gray-300">{row.Age}</td>
//                 <td className="px-4 py-2 text-center text-xs border border-gray-300">{row.Height} cm</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
// };

const PlayerInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [allPlayers, setAllPlayers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [tableRows, setTableRows] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchPlayers = async () => {
        try {
            const response = await axios.get("http://3.137.198.246:3001/init");
            const players = response.data;

            setAllPlayers(players);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    fetchPlayers();
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
  
    if (value.trim() !== "") {
      const prioritizedSuggestions = allPlayers
        .map((player) => {
          const nameSegments = player.Name.split(" ").map((segment) => segment.toLowerCase());
          const value_lower = value.toLowerCase();
  
          // Assign priority
          let priority = null;
          if (nameSegments[nameSegments.length - 1]?.startsWith(value_lower)) {
            priority = 1; // Prefix match on last name
          } else if (nameSegments[0]?.startsWith(value_lower)) {
            priority = 2; // Prefix match on first name
          } else if (nameSegments[0]?.includes(value_lower) || nameSegments[1]?.includes(value_lower)) {
            priority = 3; // Match any segment of the name
          }
  
          return priority !== null ? { ...player, priority } : null;
        })
        .filter(Boolean) // Remove null values (non-matches)
        .sort((a, b) => a.priority - b.priority) // Sort by priority
        .slice(0, 8); // Limit to 8 results
  
      setSuggestions(prioritizedSuggestions);
      setHighlightedIndex(0);
    } else {
      setSuggestions([]); // Clear suggestions when input is empty
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (event) => {
    if (suggestions.length > 0) {
      if (event.key === "ArrowDown") {
        // Move down in the suggestions list
        setHighlightedIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        // Move up in the suggestions list
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        event.preventDefault();
      } else if (event.key === "Enter") {
        // Submit the currently highlighted suggestion
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
          setHighlightedIndex(-1); // Reset the highlight after submission
        }
        event.preventDefault();
      }
    }
  };

  const handleSuggestionClick = async (player) => {
    setInputValue(player.Name);
    setSuggestions([]);

    handleSubmit(player);
  };

  const handleSubmit = async (player) => {
    try {
        const response = await axios.post("http://3.137.198.246:3001/guess", player);
        setTableRows((prevRows) => [...prevRows, {player, correctness: response.data}]);
    } catch (err) {
        console.error("Error guessing player:", err);
    }

    setInputValue("");
    setSuggestions([]);
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <div className="text-center">
        <InputField
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          inputRef={inputRef}
        />
        {suggestions.length > 0 && (
          <SuggestionList
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            highlightedIndex={highlightedIndex}
            inputWidth={inputRef.current ? inputRef.current.offsetWidth : 0}
          />
        )}
      </div>
      {/* <div className="absolute top-full left-0 w-full mt-4">
        <PlayerTable rows={tableRows} correctData={correctPlayer}/>
      </div> */}
      <div className="absolute top-full left-0 w-full">
        <PlayerTable rows={tableRows} />
      </div>
    </div>
  );
};

export default PlayerInput;
