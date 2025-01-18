import { Link } from "react-router-dom";
import { GiSelfLove } from "react-icons/gi";

const Layout = () => {
return (
    <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <GiSelfLove style={{ width: "100px", color: 'blue', padding: '1px', paddingLeft: '20px', borderRadius: '5px', fontSize: '50px' }} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item" key="home">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item" key="Credencial">
                            <Link className="nav-link" to="/Credencial">Credencial</Link>
                        </li>
                        <li className="nav-item" key="contact">
                            <Link className="nav-link" to="/contact">Contact</Link>
                        </li>
                        <li className="nav-item" key="contact">
                            <Link className="nav-link" to="/admission">Admssion</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        {/* <Outlet /> */}
    </>
)
};

export default Layout;