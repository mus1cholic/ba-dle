import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import PlayerTable from "./PlayerTable";

const saveGuessToCookies = (playerName) => {
  // we are saving guesses as strings, and calling api to load them when page is loaded
  const cookieName = "student_guesses";
  const currentGuesses = getGuessesFromCookies();

  const updatedGuesses = [...currentGuesses, playerName];

  Cookies.set(cookieName, JSON.stringify(updatedGuesses), { expires: 7 });
};

const getGuessesFromCookies = () => {
  const guesses = Cookies.get("student_guesses");

  return guesses ? JSON.parse(guesses) : [];
};

const InputField = ({ inputValue, handleInputChange, handleSubmit, inputRef, placeholderText }) => {
  return (
    <form onSubmit={(event) => handleSubmit(event, null)}>
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholderText}
        value={inputValue}
        onChange={handleInputChange}
        className="border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-35vw"
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

const PlayerInput = () => {
  const [placeholderText, setPlaceholderText] = useState("Guess the mystery student!")
  const [inputValue, setInputValue] = useState("");
  const [allPlayers, setAllPlayers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [tableRows, setTableRows] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchPlayers = async () => {
        try {
            const response = await axios.get("https://ba-minigames.xyz/api/init");
            const players = response.data;

            setAllPlayers(players);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    if (allPlayers.length > 0 && tableRows.length === 0) {
      const guesses = getGuessesFromCookies();

      guesses.map(async (playerName) => {
        const player = allPlayers.find((obj) => obj.Name === playerName);
        try {
          const response = await axios.post("https://ba-minigames.xyz/api/guess", player);

          setTableRows((prevRows) => [...prevRows, {player, correctness: response.data}]);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }, [allPlayers]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
  
    if (value.trim() !== "") {
      const prioritizedSuggestions = allPlayers
        .map((player) => {
          const nameSegments = player.Name.split(" ").map((segment) => segment.toLowerCase());
          const value_lower = value.toLowerCase();
  
          let priority = null;
          if (nameSegments[nameSegments.length - 1]?.startsWith(value_lower)) {
            priority = 1;
          } else if (nameSegments[0]?.startsWith(value_lower)) {
            priority = 2;
          } else if (nameSegments[0]?.includes(value_lower) || nameSegments[1]?.includes(value_lower)) {
            priority = 3;
          }
  
          return priority !== null ? { ...player, priority } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 8);
  
      setSuggestions(prioritizedSuggestions);
      setHighlightedIndex(0);
    } else {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (event) => {
    if (suggestions.length > 0) {
      if (event.key === "ArrowDown") {
        setHighlightedIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        event.preventDefault();
      } else if (event.key === "Enter") {
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
          setHighlightedIndex(-1); // Reset the highlight after submission
        }
        event.preventDefault();
      }
    }
  };

  const handleSuggestionClick = async (player) => {
    setInputValue("");
    setSuggestions([]);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    handleSubmit(null, player);
  };

  const handleSubmit = async (event, player) => {
    if (event) {
      event.preventDefault();
      return; 
    }

    setPlaceholderText("Not quite right... try another?");

    try {
        const response = await axios.post("https://ba-minigames.xyz/api/guess", player);

        saveGuessToCookies(player.Name);
        setTableRows((prevRows) => [...prevRows, {player, correctness: response.data}]);
    } catch (err) {
        console.error("Error guessing player:", err);
    }
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <div className="text-center">
        <InputField
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          inputRef={inputRef}
          placeholderText={placeholderText}
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