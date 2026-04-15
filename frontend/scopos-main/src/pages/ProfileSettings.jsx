import "./ProfileSettings.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { t } from "../utils/appSettings";

export default function ProfileSettings() {
  const fileInputRef = useRef(null);
  const text = t();

  const [fullName, setFullName] = useState("Togzhan");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("profileData")) || {};
    const savedUser = JSON.parse(localStorage.getItem("user")) || {};

    setFullName(savedProfile.fullName || savedUser.username || "Togzhan");
    setEmail(savedProfile.email || savedUser.email || "");
    setPhone(savedProfile.phone || "");
    setLocation(savedProfile.location || "");
    setStatus(savedProfile.status || "");
    setAbout(savedProfile.about || "");
    setAvatar(localStorage.getItem("userAvatar") || "");
  }, []);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(text.uploadImageFile);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageBase64 = reader.result;
      setAvatar(imageBase64);
      localStorage.setItem("userAvatar", imageBase64);
      window.dispatchEvent(new Event("storage"));
      toast.success(text.profilePhotoUpdated);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    localStorage.removeItem("userAvatar");
    window.dispatchEvent(new Event("storage"));
    toast.success(text.profilePhotoRemoved);
  };

  const handleSaveProfile = () => {
    const profileData = { fullName, email, phone, location, status, about };
    localStorage.setItem("profileData", JSON.stringify(profileData));
    localStorage.setItem("userName", fullName || "Togzhan");
    toast.success(text.profileSaved);
    window.dispatchEvent(new Event("storage"));
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleSubscribe = () => {
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error(text.cardNumberError);
      return;
    }

    if (!cardName.trim()) {
      toast.error(text.cardHolderRequired);
      return;
    }

    if (expiry.length !== 5) {
      toast.error(text.expiryError);
      return;
    }

    if (cvv.length < 3) {
      toast.error(text.cvvError);
      return;
    }

    const paymentData = {
      cardNumber,
      cardName,
      expiry,
      cvv,
      subscribed: true,
      plan: "Scopos Premium",
    };

    localStorage.setItem("paymentData", JSON.stringify(paymentData));
    toast.success(text.subscriptionActivated);
    setIsSubscriptionOpen(false);
  };

  return (
    <>
      <div className="profile-settings-page">
        <div className="profile-left-column">
          <div className="profile-main-card">
            <div className="profile-header-row">
              <div className="profile-user-block">
                <div className="profile-avatar-wrap">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {fullName?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                  )}

                  <button
                    type="button"
                    className="change-avatar-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {text.changePhoto}
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      className="remove-avatar-btn"
                      onClick={handleRemoveAvatar}
                    >
                      {text.remove}
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden-avatar-input"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="profile-user-meta">
                  <h3>{fullName || "Togzhan"}</h3>
                  <p>{email || "example@mail.com"}</p>
                </div>
              </div>
            </div>

            <div className="profile-info-row">
              <span>{text.name}</span>
              <input
                className="profile-inline-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={text.enterFullName}
              />
            </div>

            <div className="profile-info-row">
              <span>{text.emailAccount}</span>
              <input
                className="profile-inline-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text.enterEmail}
              />
            </div>

            <div className="profile-info-row">
              <span>{text.mobileNumber}</span>
              <input
                className="profile-inline-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={text.addNumber}
              />
            </div>

            <div className="profile-info-row">
              <span>{text.location}</span>
              <select
                className="profile-inline-input profile-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">{text.selectCity}</option>
                <option value="Almaty">{text.cityAlmaty}</option>
                <option value="Astana">{text.cityAstana}</option>
                <option value="Shymkent">{text.cityShymkent}</option>
                <option value="Karaganda">{text.cityKaraganda}</option>
                <option value="Aktobe">{text.cityAktobe}</option>
              </select>
            </div>
          </div>

          <div className="profile-extra-card">
            <div className="profile-info-row">
              <span>{text.status}</span>
              <input
                className="profile-inline-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder={text.writeStatus}
              />
            </div>

            <div className="profile-info-row profile-textarea-row">
              <span>{text.aboutMe}</span>
              <textarea
                className="profile-inline-input profile-textarea"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder={text.tellAboutYourself}
              />
            </div>
          </div>

          <button className="profile-save-main-btn" onClick={handleSaveProfile}>
            {text.saveChange}
          </button>
        </div>

        <div className="profile-right-column">
          <div className="payment-card">
            <h3>{text.paymentDetails}</h3>

            <div className="payment-logos">
              <div className="payment-logo visa-logo">VISA</div>
              <div className="payment-logo mastercard-logo">
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div className="subscription-card">
            <h3>
              {text.individualSubscription}
              <br />
              Scopos Premium
            </h3>

            <ul>
              <li>{text.monthFreeSubscription}</li>
              <li>{text.moreFeatures}</li>
              <li>{text.cancelAnytime}</li>
              <li>{text.dollarsPerMonth}</li>
            </ul>

            <button className="subscribe-btn" onClick={() => setIsSubscriptionOpen(true)}>
              {text.subscribe}
            </button>
          </div>
        </div>
      </div>

      {isSubscriptionOpen && (
        <div
          className="subscription-modal-overlay"
          onClick={() => setIsSubscriptionOpen(false)}
        >
          <div className="subscription-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{text.paymentDetails}</h2>
            <p className="subscription-modal-subtitle">{text.enterCardData}</p>

            <input
              className="payment-input"
              type="text"
              placeholder={text.cardNumber}
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            />

            <input
              className="payment-input"
              type="text"
              placeholder={text.cardHolderName}
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
            />

            <div className="payment-row">
              <input
                className="payment-input"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />

              <div className="cvv-wrap">
                <input
                  className="payment-input cvv-input"
                  type={showCvv ? "text" : "password"}
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                />
                <button
                  type="button"
                  className="show-cvv-btn"
                  onClick={() => setShowCvv(!showCvv)}
                >
                  {showCvv ? text.hide : text.show}
                </button>
              </div>
            </div>

            <div className="subscription-modal-actions">
              <button
                className="cancel-subscription-btn"
                onClick={() => setIsSubscriptionOpen(false)}
              >
                {text.cancel}
              </button>

              <button className="confirm-subscription-btn" onClick={handleSubscribe}>
                {text.payFive}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
