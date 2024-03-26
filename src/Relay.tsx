import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "/src/Relay.css";

const Relay = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [previousWord, setPreviousWord] = useState("");
  const [message, setMessage] = useState("");
  const [isFirstWord, setIsFirstWord] = useState(true);
  const [definition, setDefinition] = useState("");
  const [showToast, setShowToast] = useState(false);

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
          if (definitionNode) {
            setDefinition(definitionNode.textContent || "");
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
        } else {
          setMessage("올바른 단어를 입력하세요!");
          setShowToast(true);
        }
      } else {
        setMessage("유효하지 않는 단어입니다!");
        setShowToast(true);
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
      {definition && <p className="definition">{definition}</p>}
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
