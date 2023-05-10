import {useState, useEffect, useRef, useCallback} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {v4 as uuidv4} from 'uuid';
import './App.css';
import BeatLoader from "react-spinners/BeatLoader";

function App() {
    const inputRef = useRef(null);
    const emojiRecommendationBarRef = useRef(null);
    const tutorialRef = useRef(null);

    const [debug, setDebug] = useState(false);

    const [messages, setMessages] = useState([
        {id: 1, text: 'Hallo', self: false},
        {id: 3, text: 'Hoe voel je je?', self: false},
    ]);

    const [newMessage, setNewMessage] = useState('');

    const [showLoader, setShowLoader] = useState(false);
    const [tutorialShown, setTutorialShown] = useState(true);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    const [emojiRecommendationBarVisible, setEmojiRecommendationBarVisible] = useState(false);
    const [emojiRecommendation, setEmojiRecommendation] = useState(null);

    const [emojiSelected, setEmojiSelected] = useState(false);
    const [counter, setCounter] = useState(0);

    async function fetchEmojiRecommendation(controller) {
        setCounter(counter + 1);

        try {
            const response = await fetch('https://serverless-shit.ikbenmel.vin/api/analyseEmoji', {
                method: 'POST',
                body: JSON.stringify({
                    message: newMessage
                }),
                headers: {'Content-Type': 'application/json'},
                signal: controller.signal
            });
            const res = await response.json();
            return JSON.parse(res.data);
        } catch (err) {
            throw err;
        }
    }

    // TODO: Should be rewritten to when emojiRecommendation updates
    useEffect(() => {
        if (emojiSelected) return;
        if (debug) return;

        let controller = new AbortController();

        if (newMessage.length === 0) {
            if (emojiRecommendationBarVisible) setEmojiRecommendationBarVisible(false);
            return;
        }

        const timer = setTimeout(async () => {

            if (newMessage.length > 0) {
                try {
                    setShowLoader(true);
                    const emojiRecommendationResponse = await fetchEmojiRecommendation(controller);
                    setEmojiRecommendation(emojiRecommendationResponse);
                    setEmojiRecommendationBarVisible(true);
                    setShowLoader(false);
                } catch (err) {
                    console.error(err);
                    setShowLoader(false);
                }
            } else {
                setShowLoader(false);
                setEmojiRecommendationBarVisible(false);
            }

        }, 500);

        return () => {
            controller.abort();
            clearTimeout(timer);
        }
    }, [newMessage, emojiSelected]);

    function onSubmit(e) {
        e.preventDefault();
        if(newMessage.length === 0) return;
        if(!tutorialShown) return;

        const newMessageObject = {
            id: uuidv4(),
            text: newMessage,
            self: true
        }
        setMessages([...messages, newMessageObject]);
        setNewMessage('');
        setEmojiRecommendationBarVisible(false);
    }

    function onInput(e) {
        setNewMessage(e.target.value);
        setEmojiSelected(false);
    }

    function onEmojiRecommendationClick(pair) {
        if(!tutorialShown) setTutorialShown(true);
        inputRef.current.focus();
        setEmojiSelected(prevEmojiSelected => !prevEmojiSelected);
        setNewMessage(newMessage + " " + `${emojiSelected ? pair[0] : pair[1]}`);
    }

    const handleKeyPress = useCallback((event) => {

        if (event.key === "Enter") {
            if (!tutorialShown && tutorialStep === 2) setTutorialShown(true);

            if (document.activeElement.tagName === "BUTTON") return;
            event.preventDefault();
            onSubmit(event);
        }

        if (event.key === "ArrowLeft") {
            if (!tutorialShown && tutorialStep === 1) setTutorialStep(2);

            if (document.activeElement.tagName === "BUTTON") {
                const buttons = document.querySelectorAll(".emoji-recommendation-bar-container button");
                const activeElementIndex = Array.from(buttons).indexOf(document.activeElement);

                if (activeElementIndex === 0) {
                    buttons[buttons.length - 1].focus({
                        focusVisible: true
                    });
                } else {
                    buttons[activeElementIndex - 1].focus({
                        focusVisible: true
                    });
                }
            }

        }

        if (event.key === "ArrowRight") {
            if (!tutorialShown && tutorialStep === 1) setTutorialStep(2);

            if (document.activeElement.tagName === "BUTTON") {
                const buttons = document.querySelectorAll(".emoji-recommendation-bar-container button");
                const activeElementIndex = Array.from(buttons).indexOf(document.activeElement);

                if (activeElementIndex === buttons.length - 1) {
                    buttons[0].focus({
                        focusVisible: true
                    });
                } else {
                    buttons[activeElementIndex + 1].focus({
                        focusVisible: true
                    });
                }
            }
        }

        if (event.key === "ArrowUp") {
            if (!emojiRecommendationBarVisible) return;
            if (!tutorialShown && tutorialStep === 0) setTutorialStep(1);

            const buttons = document.querySelectorAll(".emoji-recommendation-bar-container button");
            buttons[0].focus({
                focusVisible: true
            });
        }

        if (event.key === "ArrowDown") {
            if (document.activeElement.tagName === "BUTTON") {
                inputRef.current.focus({
                    focusVisible: true
                });
            }
        }

    }, [emojiRecommendationBarVisible, newMessage, tutorialStep, tutorialShown]);

    useEffect(() => {
        if (debug) {
            setEmojiRecommendationBarVisible(true);
            setEmojiRecommendation({
                "emoticon_pairs": [
                    ["👋", "😃"],
                    ["👋", "👀"],
                    ["🙌", "😊"],
                    ["😍", "👋"],
                    ["😃", "👀"],
                    ["😊", "🤝"]
                ]
            });
        } else {
            setEmojiRecommendationBarVisible(false);
            setEmojiRecommendation(null);
        }
    }, [debug])

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress)

        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [handleKeyPress])

    return (<>
        {/*<button id="debug" className={debug ? 'active' : ''}*/}
        {/*        onClick={() => setDebug(!debug)}>DEBUG {debug ? 'on' : 'off'}</button>*/}

        {!tutorialShown && emojiRecommendationBarVisible && <div className="tutorial-container">
            <div className="tutorial" ref={tutorialRef}>
                Toetsenbord Tutorial, druk om te selecteren: <br/>
                <div className="keys">
                    {tutorialStep === 0 &&
                        <div className="key">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                    }
                    {tutorialStep === 1 && <>
                        <div className="key active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                        <div className="key">
                            <svg style={{"transform": "rotate(-90deg)"}} xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                        <div className="key">
                            <svg style={{"transform": "rotate(90deg)"}} xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                    </>}
                    {tutorialStep === 2 && <>
                        <div className="key active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                        <div className="key active">
                            <svg style={{"transform": "rotate(-90deg)"}} xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                        <div className="key active">
                            <svg style={{"transform": "rotate(90deg)"}} xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 24 24" fill="currentColor"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            </svg>
                        </div>
                        <div className="key enter">
                            enter
                        </div>
                    </>}
                </div>
            </div>
        </div>}

        <div className="chat-container">
            <div className="messages-container">
                <ul className="message-list">
                    {messages.map((message, index) => (
                        <li key={message.id} className={`message ${message.self ? 'self' : ''}`}>{message.text}</li>
                    ))}
                </ul>
            </div>

            <div className="new-message-container">
                {emojiRecommendationBarVisible && <>
                    <div className="emoji-recommendation-bar-container">
                        <div className="emoji-recommendation-bar" ref={emojiRecommendationBarRef}>
                            {emojiRecommendation.emoticon_pairs.map((pair, index) => (
                                <button key={index} tabIndex={index} onClick={() => {
                                    onEmojiRecommendationClick(pair);
                                }}>
                                    {
                                        emojiSelected ? pair[0] : pair[1]
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </>}

                {showLoader && <div className="loader-container">
                    <div className="emoji-recommendation-bar"><BeatLoader color="#6B8AFD"/></div>
                </div>}
                <form action="">
                    <TextareaAutosize name="chatMessage" ref={inputRef} type="text" onInput={onInput}
                                      value={newMessage}/>
                    <button onClick={onSubmit} disabled={!tutorialShown}>Send</button>
                </form>
            </div>
        </div>
    </>)
        ;
}

export default App;
