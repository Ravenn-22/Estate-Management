import './Spinner.css'

const Spinner = ({ fullScreen = false }) => {
  const loader = (
    <div className="loader-wrapper">
      <div className="juggler">
        <div className="head"></div>
        <div className="body"></div>
        <div className="arm right-arm"></div>
        <div className="arm left-arm"></div>
      </div>
      <div className="ball ball-1"></div>
      <div className="ball ball-2"></div>
      <div className="ball ball-3"></div>
    </div>
  );

  return fullScreen ? (
    <div className="spinner-fullscreen">{loader}</div>
  ) : (
    <div className="spinner-wrapper">{loader}</div>
  );
};

export default Spinner;