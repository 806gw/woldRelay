import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "./Relay.css";

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
    const [trimmedDefinition, setTrimmedDefinition] = useState("");
    const [timer, setTimer] = useState(10); // 타이머 상태 추가 및 초기값 설정
    const [gameStarted, setGameStarted] = useState(false); // 게임 시작 여부 상태 추가

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentWord(e.target.value);
    };

    useEffect(() => {
        if (showToast) {
            const timeout = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [showToast]);

    useEffect(() => {
        const maxLength = 20;
        if (definition.length > maxLength) {
            setTrimmedDefinition(definition.slice(0, maxLength) + "...");
        } else {
            setTrimmedDefinition(definition);
        }
    }, [definition]);

    useEffect(() => {
        // 타이머 감소 및 타이머가 0이 되면 게임 종료
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            // 타이머가 0이 되면 게임 종료
            alert("게임 종료!");
            setGameStarted(false);
            setPreviousWord("");
            setCurrentWord("");
            setDefinition("");
            setPos("");
            setWord("");
            setIsFirstWord(true);
            setMessage("");
            setPrevDefinition("");
            setTimer(10);
        }
    }, [timer]);

    const handleStartGame = () => {
        setGameStarted(true);
        setTimer(10); // 타이머 초기화
        setMessage("");
    };

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
                    setTimer(10); // 타이머 초기화
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
            {!gameStarted && (
                <div>
                    <p>게임을 시작하시겠습니까?</p>
                    <button onClick={handleStartGame}>시작하기</button>
                </div>
            )}
            {gameStarted && (
                <div>
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
                    <div className="timer">{timer}s</div> {/* 타이머 표시 */}
                    {showToast && <div className="toast">{message}</div>}
                </div>
            )}
        </div>
    );
};

export default Relay;
