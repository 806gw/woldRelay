import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "/src/Relay.css";

const Relay = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [previousWord, setPreviousWord] = useState("");
  const [message, setMessage] = useState("");
  const [isFirstWord, setIsFirstWord] = useState(true);
  const [definition, setDefinition] = useState("");
  const [pos, setPos] = useState(""); // 단어의 품사를 저장하는 상태
  const [word, setWord] = useState(""); // 단어를 저장하는 상태
  const [showToast, setShowToast] = useState(false);
  const [prevDefinition, setPrevDefinition] = useState(""); // 이전 올바른 단어의 뜻을 저장하기 위한 상태

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentWord(e.target.value);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000); // 팝업이 3초 후에 사라지도록 설정
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
          setPrevDefinition(definition); // 올바른 단어일 경우 현재 뜻을 이전 뜻으로 저장합니다.
        } else {
          setMessage("올바른 단어를 입력하세요!");
          setShowToast(true);
          setDefinition(""); // 이전 단어가 맞지 않으면 뜻을 초기화합니다.
        }
      } else {
        setMessage("유효하지 않는 단어입니다!");
        setShowToast(true);
        setDefinition(""); // 유효하지 않은 단어일 경우 뜻을 초기화합니다.
      }
    } catch (error) {
      console.error("API 호출 중 에러 발생:", error);
      alert("같은 단어를 썼습니다.");
    }
  };

  return (
    <div className="word-box">
      <div className="previousWord">
        <div className="prev-quality">
          <p id="previousWord">{previousWord}</p>
        </div>
      </div>
      {(isFirstWord || definition) && (
        <div>
          <p className="definition">{isFirstWord ? prevDefinition : definition}</p>
          <p>품사: {pos}</p>
          <p>단어: {word}</p>
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
