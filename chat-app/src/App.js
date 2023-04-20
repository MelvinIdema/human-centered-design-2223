import {useState, useEffect, useRef} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {v4 as uuidv4} from 'uuid';
import './App.css';
import BeatLoader from "react-spinners/BeatLoader";

function App() {
    const inputRef = useRef();
    const [messages, setMessages] = useState([
        {id: 1, text: 'Hello', self: false},
        {id: 2, text: 'Hello World!', self: false},
        {id: 3, text: 'Hello World! How are you?', self: true},
    ]);

    const [newMessage, setNewMessage] = useState('');

    const [showLoader, setShowLoader] = useState(false);

    const [emojiRecommendationBarVisible, setEmojiRecommendationBarVisible] = useState(false);
    const [emojiRecommendation, setEmojiRecommendation] = useState(null);

    const [emojiSelected, setEmojiSelected] = useState(false);
    const [counter, setCounter] = useState(0);

    async function fetchEmojiRecommendation() {
        setCounter(counter + 1);

        console.log("fetching ", counter);
        try {
            const response = await fetch('https://serverless-shit.ikbenmel.vin/api/analyseEmoji', {
                method: 'POST',
                body: JSON.stringify({
                    message: newMessage
                }),
                headers: {'Content-Type': 'application/json'}
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

        if (newMessage.length === 0) {
            if (emojiRecommendationBarVisible) setEmojiRecommendationBarVisible(false);
            return;
        }
        ;

        setShowLoader(true);
        const timer = setTimeout(async () => {

            if (newMessage.length > 0) {
                try {
                    const emojiRecommendationResponse = await fetchEmojiRecommendation();
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

        }, 1000);

        return () => clearTimeout(timer);
    }, [newMessage]);

    function onSubmit(e) {
        e.preventDefault();
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
        inputRef.current.focus();
        setEmojiSelected(true);
        setNewMessage(newMessage + pair[0] + " " + pair[1]);
    }

    return (<>
        <div className="chat-container">
            <div className="messages-container">
                <ul className="message-list">
                    {messages.map((message, index) => (
                        <li key={message.id} className={`message ${message.self ? 'self' : ''}`}>{message.text}</li>
                    ))}
                </ul>
            </div>

            <div className="new-message-container">
                {emojiRecommendationBarVisible &&
                    <div className="emoji-recommendation-bar-container">
                        <div className="emoji-recommendation-bar">
                            {emojiRecommendation.emoticon_pairs.map((pair, index) => (
                                <button key={index} onClick={() => {
                                    onEmojiRecommendationClick(pair);
                                }}>
                                    {pair[0]}
                                    {pair[1]}
                                </button>
                            ))}
                        </div>
                    </div>
                }

                {showLoader && <div className="loader-container"><div className="emoji-recommendation-bar"><BeatLoader color="#6B8AFD"/></div></div>}
                <form action="">
                    <TextareaAutosize name="chatMessage" ref={inputRef} type="text" onInput={onInput} value={newMessage}/>
                    <button onClick={onSubmit}>Send</button>
                </form>
            </div>
        </div>
    </>)
        ;
}

export default App;
