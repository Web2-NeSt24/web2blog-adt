import React from 'react';
import { Nav, Image, Dropdown } from 'react-bootstrap';

export interface SidebarProps {
  logoSvgId?: string;
  logoAlt?: string;
  userName: string;
  userImageSrc: string;
  navItems?: Array<{
    key: string;
    label: string;
    iconSvgId: string;
    href: string;
  }>;
  fixed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  logoSvgId = 'bootstrap',
  logoAlt = 'Logo',
  userName,
  userImageSrc,
  navItems = [
    { key: 'home', label: 'Home', iconSvgId: 'home', href: '#' },
    { key: 'dashboard', label: 'Dashboard', iconSvgId: 'speedometer2', href: '#' },
    { key: 'orders', label: 'Orders', iconSvgId: 'table', href: '#' },
    { key: 'products', label: 'Products', iconSvgId: 'grid', href: '#' },
    { key: 'customers', label: 'Customers', iconSvgId: 'people-circle', href: '#' },
  ],
  fixed = false,
}) => {
  return (
    <div
      className={`d-flex flex-column flex-shrink-0 p-3 text-bg-dark${fixed ? ' vh-100' : ''}`}
      style={fixed
        ? { width: 280, position: 'fixed', top: 0, left: 0, zIndex: 1000 }
        : { width: '100%', height: '100%', minHeight: '100%' }}
    >
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <svg className="bi pe-none me-2" width={40} height={32} aria-hidden="true">
          <use xlinkHref={`#${logoSvgId}`} />
        </svg>
        <span className="fs-4">Sidebar</span>
      </a>
      <hr />
      <Nav variant="pills" defaultActiveKey={navItems[0].key} className="flex-column mb-auto">
        {navItems.map(item => (
          <Nav.Item key={item.key}>
            <Nav.Link
              href={item.href}
              eventKey={item.key}
              className="text-white"
            >
              <svg className="bi pe-none me-2" width={16} height={16} aria-hidden="true">
                <use xlinkHref={`#${item.iconSvgId}`} />
              </svg>
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <hr />
      <Dropdown>
        <Dropdown.Toggle
          as="a"
          className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
          style={{ cursor: 'pointer' }}
        >
          <Image
            src={userImageSrc}
            alt={userName}
            width={32}
            height={32}
            roundedCircle
            className="me-2"
          />
          <strong>{userName}</strong>
        </Dropdown.Toggle>
        <Dropdown.Menu variant="dark" className="text-small shadow">
          <Dropdown.Item href="#">New project...</Dropdown.Item>
          <Dropdown.Item href="#">Settings</Dropdown.Item>
          <Dropdown.Item href="#">Profile</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="#">Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
