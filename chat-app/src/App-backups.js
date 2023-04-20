import {useState, useEffect, useRef} from 'react';
import {v4 as uuidv4} from 'uuid';
import './App.css';
import EmojiPicker from 'emoji-picker-react';
import BeatLoader from "react-spinners/BeatLoader";

function App() {
    const inputRef = useRef();
    const [messages, setMessages] = useState([
        {id: 1, text: 'Hello', self: false},
        {id: 2, text: 'Hello World!', self: false},
        {id: 3, text: 'Hello World! How are you?', self: true},
    ]);

    const [newMessage, setNewMessage] = useState('');

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const [emojiRecommendationBarVisible, setEmojiRecommendationBarVisible] = useState(false);
    const [emojiRecommendation, setEmojiRecommendation] = useState({
        "emoticon_pairs": [
            ["👋", "😃"],
            ["👋", "👀"],
            ["🙌", "😊"],
            ["😍", "👋"],
            ["😃", "👀"],
            ["😊", "🤝"]
        ]
    });

    const [emojiSelected, setEmojiSelected] = useState(false);

    async function fetchEmojiRecommendation() {
        try {
            const response = await fetch('https://serverless-shit.ikbenmel.vin/api/analyseEmoji', {
                method: 'POST',
                body: JSON.stringify({
                    message: newMessage
                }),
                headers: {'Content-Type': 'application/json'}
            });
            const json = await response.json();
            return json;
        } catch(err) {
            throw err;
        }
    }

    useEffect(() => {
        async function fetch() {
            const result = await fetchEmojiRecommendation();
            console.log(result);
        }
        fetch();
    }, []);

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
                setShowLoader(false);
                setEmojiRecommendationBarVisible(true);
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
    }

    function onEmojiClick(emojiData, event) {
        setNewMessage(newMessage + emojiData.emoji);
        setShowEmojiPicker(false);
        setEmojiSelected(true);
    }

    function openEmojiPicker(e) {
        e.preventDefault();
        setShowEmojiPicker(!showEmojiPicker);
    }

    function onInput(e) {
        setNewMessage(e.target.value);
    }

    function onEmojiRecommendationClick(pair) {
        inputRef.current.focus();
        setNewMessage(newMessage + pair[0] + " " + pair[1]);
    }

    return (<>
        {showEmojiPicker &&
            <div className="picker">
                <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis={true}/>
            </div>
        }
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
                }

                {showLoader && <div className="emoji-recommendation-bar"><BeatLoader color="#6B8AFD"/></div>}
                <form action="">
                    <button onClick={openEmojiPicker}>😊</button>
                    <input ref={inputRef} type="text" onInput={onInput} value={newMessage}/>
                    <button onClick={onSubmit}>Send</button>
                </form>
            </div>
        </div>
    </>);
}

export default App;
