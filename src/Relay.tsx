import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "/src/Relay.css";

const Relay = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [previousWord, setPreviousWord] = useState("");
  const [message, setMessage] = useState("");
  const [isFirstWord, setIsFirstWord] = useState(true);
  const [definition, setDefinition] = useState("");
  const [pos, setPos] = useState("");
  const [word, setWord] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [prevDefinition, setPrevDefinition] = useState("");
  const [trimmedDefinition, setTrimmedDefinition] = useState(""); // 일정 길이 이상일 경우 줄여진 뜻을 저장하는 상태

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentWord(e.target.value);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    const maxLength = 20; // 최대 길이
    if (definition.length > maxLength) {
      setTrimmedDefinition(definition.slice(0, maxLength) + "...");
    } else {
      setTrimmedDefinition(definition);
    }
  }, [definition]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        "https://krdict.korean.go.kr/api/search",
        {
          params: {
            key: "D2C9174701A6D6EB8EBA17A752D09600",
            q: currentWord,
            pos: "1",
            method: "exact",
            sort: "popular",
            letter_sense: "n",
            start: "1",
            num: "10",
            advanced: "y",
            trans_lang: "1",
          },
        }
      );

      if (response.data) {
        const xmlString = response.data;
        const domParser = new DOMParser();
        const xmlDoc = domParser.parseFromString(xmlString, "text/xml");
        const senseNode = xmlDoc.querySelector("sense");

        if (senseNode) {
          const definitionNode = senseNode.querySelector("definition");
          const posNode = xmlDoc.querySelector("pos");
          const wordNode = xmlDoc.querySelector("word");

          if (definitionNode && posNode && wordNode) {
            setDefinition(definitionNode.textContent || "");
            setPos(posNode.textContent || "");
            setWord(wordNode.textContent || "");
          }
        } else {
          setMessage("올바른 단어를 입력하세요!");
          setShowToast(true);
          return;
        }

        if (isFirstWord || currentWord.charAt(0) === previousWord.slice(-1)) {
          setPreviousWord(currentWord);
          setCurrentWord("");
          setMessage("");
          setIsFirstWord(false);
          setPrevDefinition(definition);
        } else {
          setMessage("올바른 단어를 입력하세요!");
          setShowToast(true);
          setDefinition("");
        }
      } else {
        setMessage("유효하지 않는 단어입니다!");
        setShowToast(true);
        setDefinition("");
      }
    } catch (error) {
      console.error("API 호출 중 에러 발생:", error);
    }
  };

  return (
    <div className="word-box">
      <div className="previousWord">
        <div className="prev-quality">
          <p id="previousWord">이전 단어 : {previousWord}</p>
        </div>
      </div>
      {(isFirstWord || definition) && (
        <div className="introd-box">
          <div className="pos-word-box">
            {word}
            <p className="pos">{pos}</p>
          </div>
          {isFirstWord ? prevDefinition : trimmedDefinition}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={currentWord}
          onChange={handleChange}
          id="woldInput"
        />
      </form>
      {showToast && <div className="toast">{message}</div>}
    </div>
  );
};

export default Relay;
