import {useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import './App.css';
import EmojiPicker from 'emoji-picker-react';

function App() {
    const [messages, setMessages] = useState([
        {id: 1, text: 'Hello', self: false},
        {id: 2, text: 'Hello World!', self: false},
        {id: 3, text: 'Hello World! How are you?', self: true},
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
    }


    function openEmojiPicker(e) {
        e.preventDefault();
        setShowEmojiPicker(!showEmojiPicker);
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

            <form action="">
                <div className="new-message-container">
                    <button onClick={openEmojiPicker}>😊</button>
                    <input type="text" onInput={e => setNewMessage(e.target.value)} value={newMessage}/>
                    <button onClick={onSubmit}>Send</button>
                </div>
            </form>
        </div>
    </>);
}

export default App;
