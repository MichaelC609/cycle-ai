import './LandingPage.css'

function LandingPage()
{
    return (
        <div className="landing-container">
            <div className="hero-content">
                <h1 className="hero-title">
                    <span className="gradient-text">Ride Smarter
                    with Cycle AI</span>
                </h1>
                <h2 className="hero-subtitle">
                    Smart routes, weather-aware, <br />optimized for cyclists
                </h2>
            </div>
            <div className="bike-container">
  <div className="bike-3d">
    {/* Frame Components */}
    <div className="bike-frame">
      <div className="top-tube"></div>
      <div className="down-tube"></div>
      <div className="seat-tube"></div>
      <div className="chain-stay"></div>
      <div className="seat-stay"></div>
      <div className="head-tube"></div>
    </div>
    
    {/* Wheels with Spokes */}
    <div className="wheel-assembly wheel-front">
      <div className="tire"></div>
      <div className="rim"></div>
      <div className="spokes">
        <div className="spoke spoke-1"></div>
        <div className="spoke spoke-2"></div>
        <div className="spoke spoke-3"></div>
        <div className="spoke spoke-4"></div>
        <div className="spoke spoke-5"></div>
        <div className="spoke spoke-6"></div>
      </div>
      <div className="hub"></div>
    </div>
    
    <div className="wheel-assembly wheel-back">
      <div className="tire"></div>
        <div className="rim"></div>
            <div className="spokes">
                <div className="spoke spoke-1"></div>
                <div className="spoke spoke-2"></div>
                <div className="spoke spoke-3"></div>
                <div className="spoke spoke-4"></div>
                <div className="spoke spoke-5"></div>
                <div className="spoke spoke-6"></div>
            </div>
      <div className="hub"></div>
    </div>
    
    {/* Bike Components */}
    <div className="handlebars"></div>
    <div className="seat"></div>
    <div className="pedal-assembly">
      <div className="pedal"></div>
      <div className="crank"></div>
    </div>
  </div>
</div>
        </div>
    );
}

export default LandingPage