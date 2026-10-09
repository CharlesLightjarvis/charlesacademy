import React from 'react';

interface LogoProps {
    className?: string;
    style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className = '', style = {} }) => {
    return (
        <img
            src="/images/logos/CharlesAcademyTextLogo.png"
            alt="CharlesAcademy"
            className={`block h-auto w-44 object-contain ${className}`}
            style={style}
        />
    );
};

export default Logo;
