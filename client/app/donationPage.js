/*Helper Methods*/
const disabledLink = (e) => {
  e.preventDefault();
  return false;
};

/*React elements*/
const DonationPage = (props) => {
  return (
    <div>
      <p className="info">Note: This is not a real donation page. This project does not currently accept donations. This page displays a concept for a donation page that may be used if the site needs to start taking in donations to sustain further use.</p>
      <p>This Fill-In-The-Blanks game does not make any money from advertisements or payed subscriptions. All the funding for this project comes from donations. If you enjoy this service, please donate now so this site can keep running.</p>
      <div>
        <a href="" id="donateNowLink" onClick={disabledLink}
          >Donate Now!</a>
        <span> (Note: there is no donation site, this link doesn't go anywhare.)</span>
      </div>
    </div>
  );
};

/*React generation*/
const generateDonationPage = function(){
  ReactDOM.render(<DonationPage/>,document.querySelector('#content'));
};
