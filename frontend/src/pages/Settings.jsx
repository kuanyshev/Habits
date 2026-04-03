import { useRef, useState } from "react";

export default function Settings() {
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "Tozghan"
  );
  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || "tuleubekova67@mail.ru"
  );
  const [phone, setPhone] = useState(
    localStorage.getItem("userPhone") || "+7"
  );
  const [location, setLocation] = useState(
    localStorage.getItem("userLocation") || "Almaty"
  );

  const [status, setStatus] = useState(
    localStorage.getItem("userStatus") || ""
  );
  const [about, setAbout] = useState(
    localStorage.getItem("userAbout") || ""
  );

  const [editingStatus, setEditingStatus] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const [avatar, setAvatar] = useState(
    localStorage.getItem("userAvatar") || ""
  );
  const fileInputRef = useRef(null);

  const [cardNumber, setCardNumber] = useState(
    localStorage.getItem("userCardNumber") || ""
  );
  const [cardExpiry, setCardExpiry] = useState(
    localStorage.getItem("userCardExpiry") || ""
  );
  const [cardCvv, setCardCvv] = useState(
    localStorage.getItem("userCardCvv") || ""
  );
  const [cardEmail, setCardEmail] = useState(
    localStorage.getItem("userCardEmail") || email || ""
  );
  const [savedCardLast4, setSavedCardLast4] = useState(
    localStorage.getItem("userCardLast4") || ""
  );
  const [showCvv, setShowCvv] = useState(false);

  const cities = [
    "Almaty",
    "Astana",
    "Shymkent",
    "Karaganda",
    "Aktobe",
    "Atyrau",
    "Semey",
    "Taraz",
  ];

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, "");

    if (!value.startsWith("+7")) {
      if (value.startsWith("7")) {
        value = "+7" + value.slice(1);
      } else if (value.startsWith("+")) {
        value = "+7";
      } else {
        value = "+7" + value.replace(/\D/g, "");
      }
    }

    const digitsOnly = value.replace(/\D/g, "");
    const trimmedDigits = digitsOnly.slice(0, 11);

    if (trimmedDigits.startsWith("7")) {
      setPhone("+" + trimmedDigits);
    } else {
      setPhone("+7" + trimmedDigits.slice(0, 10));
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("userName", userName);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userLocation", location);
    localStorage.setItem("userStatus", status);
    localStorage.setItem("userAbout", about);
    localStorage.setItem("userAvatar", avatar);

    setEditingStatus(false);
    setEditingAbout(false);

    alert("Saved successfully!");
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result;
      setAvatar(imageBase64);
      localStorage.setItem("userAvatar", imageBase64);
    };
    reader.readAsDataURL(file);
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);

    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setCardExpiry(value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvv(value);
  };

  const handleSaveCard = () => {
    const digits = cardNumber.replace(/\D/g, "");

    if (digits.length !== 16) {
      alert("Enter a valid 16-digit card number");
      return;
    }

    if (cardExpiry.length !== 5) {
      alert("Enter expiry in MM/YY format");
      return;
    }

    if (cardCvv.length !== 3) {
      alert("Enter a valid 3-digit CVV");
      return;
    }

    if (!cardEmail.trim()) {
      alert("Enter your email");
      return;
    }

    const last4 = digits.slice(-4);

    localStorage.setItem("userCardNumber", cardNumber);
    localStorage.setItem("userCardExpiry", cardExpiry);
    localStorage.setItem("userCardCvv", cardCvv);
    localStorage.setItem("userCardEmail", cardEmail);
    localStorage.setItem("userCardLast4", last4);

    setSavedCardLast4(last4);
    setShowSubscribeModal(false);
    alert("Card saved successfully!");
  };

  const maskedCardNumber = savedCardLast4
    ? `**** **** **** ${savedCardLast4}`
    : "**** **** **** 2545";

  return (
    <div className="settings-page">
      <div className="settings-left">
        <div className="settings-card profile-card-settings">
          <div className="settings-user-row">
            <div className="avatar-block">
              {avatar ? (
                <img src={avatar} alt="User avatar" className="settings-avatar" />
              ) : (
                <div className="settings-avatar"></div>
              )}

              <button
                type="button"
                className="change-photo-btn"
                onClick={handleChoosePhoto}
              >
                Change photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden-file-input"
              />
            </div>

            <div>
              <p className="settings-user-name">{userName}</p>
              <p className="settings-user-mail">{email}</p>
            </div>
          </div>

          <div className="settings-field-row">
            <span>Name</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="settings-inline-input"
            />
          </div>

          <div className="settings-field-row">
            <span>Email account</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="settings-inline-input"
            />
          </div>

          <div className="settings-field-row">
            <span>Mobile number</span>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              className="settings-inline-input"
            />
          </div>

          <div className="settings-field-row">
            <span>Location</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="settings-inline-input settings-select"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="settings-card extra-settings-card">
          <div className="settings-field-row">
            <span>Status</span>

            {editingStatus ? (
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="settings-inline-input extra-input"
                autoFocus
              />
            ) : (
              <div className="editable-view">
                <span className="editable-text">{status ? status : ""}</span>
                <button
                  type="button"
                  className="edit-icon-btn"
                  onClick={() => setEditingStatus(true)}
                >
                  ✎
                </button>
              </div>
            )}
          </div>

          <div className="settings-field-row about-row">
            <span>About me</span>

            {editingAbout ? (
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="about-textarea"
                autoFocus
              />
            ) : (
              <div className="editable-view about-view">
                <span className="editable-text about-text">
                  {about ? about : ""}
                </span>
                <button
                  type="button"
                  className="edit-icon-btn"
                  onClick={() => setEditingAbout(true)}
                >
                  ✎
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="button" className="save-btn" onClick={handleSaveSettings}>
          Save Change
        </button>
      </div>

      <div className="settings-right">
        <div className="payment-card payment-details-card">
          <h3>Payment details</h3>
          <p className="payment-label">Card number:</p>
          <div className="saved-card-number-box">{maskedCardNumber}</div>

          <div className="payment-brand-row">
  <div className="pay-logo-box visa-box">
    <span className="visa-text">VISA</span>
  </div>

  <div className="pay-logo-box master-box">
    <div className="mc-wrapper">
      <span className="mc-red"></span>
      <span className="mc-orange"></span>
    </div>
  </div>
</div>
        </div>

        <div className="premium-card">
          <h3>Individual subscription SCOPOS Premium</h3>
          <ul>
            <li>1 month free subscription</li>
            <li>More features</li>
            <li>Cancel anytime</li>
            <li>$5 per month</li>
          </ul>

          <button
            type="button"
            className="subscribe-btn"
            onClick={() => setShowSubscribeModal(true)}
          >
            Subscribe
          </button>
        </div>
      </div>

      {showSubscribeModal && (
        <div
          className="subscribe-modal-overlay"
          onClick={() => setShowSubscribeModal(false)}
        >
          <div
            className="subscribe-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="subscribe-top-card">
              <p className="subscribe-top-title">Subscribe to Scopos Premium</p>
              <div className="subscribe-price-row">
                <span className="old-price">$5.00</span>
                <span className="new-price">$0</span>
              </div>

              <div className="subscribe-summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>

              <div className="subscribe-summary-row total">
                <span>Total payable today</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="subscribe-form">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={cardEmail}
                onChange={(e) => setCardEmail(e.target.value)}
              />

              <div className="card-type-row">
                <span className="card-icon">💳</span>
                <span>Card</span>
              </div>

              <label>Card number</label>
              <div className="card-input-wrap">
                <input
                  type="text"
                  placeholder="1234 1234 1234 1234"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
                <div className="inline-card-logos">
                  <span className="mini-visa">VISA</span>
                  <span className="mini-master">
                    <span className="mini-mc-left"></span>
                    <span className="mini-mc-right"></span>
                  </span>
                </div>
              </div>

              <div className="subscribe-two-cols">
                <div>
                  <label>Expiration</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                  />
                </div>

                <div>
                  <label>CVV</label>
                  <div className="cvv-wrap">
                    <input
                      type={showCvv ? "text" : "password"}
                      placeholder="***"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                    />
                    <button
                      type="button"
                      className="cvv-toggle-btn"
                      onClick={() => setShowCvv(!showCvv)}
                    >
                      {showCvv ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <label>Country</label>
              <select defaultValue="Kazakhstan">
                <option>Kazakhstan</option>
                <option>Russia</option>
                <option>Uzbekistan</option>
                <option>Kyrgyzstan</option>
              </select>

              <button
                type="button"
                className="done-btn"
                onClick={handleSaveCard}
              >
                Save card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}