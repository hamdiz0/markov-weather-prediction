import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled, { keyframes, css } from 'styled-components'
import { Database, Cloud, BarChart3, Check } from 'lucide-react'
import './App.css'

import Matrix from './components/matrix.jsx'
import Today from './components/today.jsx'
import PredictionResults from './components/graph.jsx'

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const heroVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

const STEPS = [
  { id: 1, label: 'Generate Matrix', icon: Database },
  { id: 2, label: 'Select Weather', icon: Cloud },
  { id: 3, label: 'View Forecast', icon: BarChart3 },
];

function App() {
  const [MatrixData, setMatrixData] = useState(null);
  const [PredictionData, setPredictionData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showProgress, setShowProgress] = useState(false);

  const handleMatrixData = (data) => {
    setMatrixData(data);
    setCurrentStep(2);
    setShowProgress(true);
  }

  const handlePredictionData = (data) => {
    setPredictionData(data);
    setCurrentStep(3);
  }

  // Track scroll position to show/hide progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      setShowProgress(scrollY > heroHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStep = (stepId) => {
    let targetId = '';
    switch(stepId) {
      case 1:
        targetId = 'matrix';
        break;
      case 2:
        targetId = 'today';
        break;
      case 3:
        targetId = 'prediction_results';
        break;
      default:
        return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <AppContainer
      as={motion.div}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Floating Progress Indicator */}
      <AnimatePresence>
        {showProgress && (
          <ProgressIndicator
            as={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressTrack>
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isClickable = step.id <= currentStep || (step.id === 2 && MatrixData);
                
                return (
                  <ProgressStep 
                    key={step.id}
                    $isActive={isCurrent}
                    $isCompleted={isCompleted}
                    $isClickable={isClickable}
                    onClick={() => isClickable && scrollToStep(step.id)}
                  >
                    <StepDot $isActive={isCurrent} $isCompleted={isCompleted}>
                      {isCompleted ? <Check size={12} /> : <Icon size={14} />}
                    </StepDot>
                    <StepLabel $isActive={isCurrent} $isCompleted={isCompleted}>
                      {step.label}
                    </StepLabel>
                    {index < STEPS.length - 1 && (
                      <StepConnector $isCompleted={isCompleted} />
                    )}
                  </ProgressStep>
                );
              })}
            </ProgressTrack>
          </ProgressIndicator>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <HeroContent
          as={motion.div}
          variants={heroVariants}
        >
          <Badge>
            <StatusDot />
            Markov Chain Forecasting
          </Badge>
          <HeroTitle>
            <TitleLine>PREDICT THE</TitleLine>
            <TitleLine className="accent">ATMOSPHERE</TitleLine>
          </HeroTitle>
          <HeroSubtitle>
            Advanced probabilistic weather prediction for Tunisian stations 
            using Markov chain transition matrices
          </HeroSubtitle>
          <HeroSteps>
            <StepItem>
              <StepIconWrapper>
                <Database size={24} />
              </StepIconWrapper>
              <StepInfo>
                <StepNumber>01</StepNumber>
                <StepName>Generate Matrix</StepName>
              </StepInfo>
            </StepItem>
            <StepArrow>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </StepArrow>
            <StepItem>
              <StepIconWrapper className="secondary">
                <Cloud size={24} />
              </StepIconWrapper>
              <StepInfo>
                <StepNumber>02</StepNumber>
                <StepName>Select Weather</StepName>
              </StepInfo>
            </StepItem>
            <StepArrow>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </StepArrow>
            <StepItem>
              <StepIconWrapper className="tertiary">
                <BarChart3 size={24} />
              </StepIconWrapper>
              <StepInfo>
                <StepNumber>03</StepNumber>
                <StepName>View Forecast</StepName>
              </StepInfo>
            </StepItem>
          </HeroSteps>
          
          {/* Start Button */}
          <StartButton
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToStep(1)}
          >
            <span>Start Forecasting</span>
            <ButtonArrow>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3L10 17M10 17L16 11M10 17L4 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ButtonArrow>
          </StartButton>
        </HeroContent>
        <GridOverlay />
      </HeroSection>

      {/* Main Content */}
      <MainContent className="main">
        <Matrix onDataReady={handleMatrixData} />
        <Today matrixData={MatrixData} onPredictionDataReady={handlePredictionData} />
        <PredictionResults predictionData={PredictionData} />
      </MainContent>

      {/* Footer */}
      <Footer>
        <FooterContent>
          <FooterBrand>ATMOS</FooterBrand>
          <FooterText>
            Built with Markov Chains & React
          </FooterText>
        </FooterContent>
      </Footer>
    </AppContainer>
  )
}

// Keyframes
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.5); }
`;

// Styled Components
const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

// Progress Indicator
const ProgressIndicator = styled.div`
  position: fixed;
  left: var(--space-lg);
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  
  @media (max-width: 1200px) {
    left: var(--space-sm);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`

const ProgressTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--space-md);
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
`

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  position: relative;
  cursor: ${props => props.$isClickable ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.$isClickable ? 1 : 0.4};
  transition: opacity var(--transition-fast);
`

const StepDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$isCompleted ? 'var(--accent-success)' :
    props.$isActive ? 'var(--accent-primary)' : 
    'var(--bg-elevated)'};
  border: 2px solid ${props => 
    props.$isCompleted ? 'var(--accent-success)' :
    props.$isActive ? 'var(--accent-primary)' : 
    'var(--border-default)'};
  color: ${props => 
    props.$isCompleted || props.$isActive ? '#fff' : 
    'var(--text-tertiary)'};
  transition: all var(--transition-base);
  
  ${props => props.$isActive && css`
    animation: ${pulseGlow} 2s ease-in-out infinite;
  `}
`

const StepLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => 
    props.$isActive ? 'var(--accent-primary)' :
    props.$isCompleted ? 'var(--accent-success)' : 
    'var(--text-muted)'};
  text-align: center;
  max-width: 60px;
  transition: color var(--transition-fast);
`

const StepConnector = styled.div`
  width: 2px;
  height: 24px;
  background: ${props => 
    props.$isCompleted ? 'var(--accent-success)' : 
    'var(--border-subtle)'};
  margin: var(--space-xs) 0;
  transition: background var(--transition-base);
`

const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 100% 100% at 50% 0%, rgba(0, 212, 255, 0.12), transparent 50%),
    radial-gradient(ellipse 80% 60% at 80% 50%, rgba(124, 58, 237, 0.08), transparent),
    radial-gradient(ellipse 60% 80% at 20% 80%, rgba(245, 158, 11, 0.06), transparent);
  z-index: 0;
`

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-size: 60px 60px;
  z-index: 1;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
`

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: 0 var(--space-lg);
`

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 100px;
  color: var(--accent-primary);
  margin-bottom: var(--space-xl);
`

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  background: var(--accent-primary);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px var(--accent-primary);
`

const HeroTitle = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(4rem, 12vw, 9rem);
  line-height: 0.9;
  letter-spacing: 0.02em;
  margin-bottom: var(--space-lg);
`

const TitleLine = styled.span`
  display: block;
  color: var(--text-primary);
  
  &.accent {
    background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
  line-height: 1.7;
`

const HeroSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-lg) var(--space-2xl);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-xl);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
  }
`

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
`

const StepIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: var(--radius-lg);
  color: var(--accent-primary);
  transition: all var(--transition-base);
  
  &.secondary {
    background: rgba(124, 58, 237, 0.1);
    border-color: rgba(124, 58, 237, 0.3);
    color: var(--accent-secondary);
  }
  
  &.tertiary {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
    color: var(--accent-tertiary);
  }
`

const StepInfo = styled.div`
  text-align: left;
`

const StepNumber = styled.div`
  font-family: var(--font-mono);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 2px;
`

const StepName = styled.div`
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
`

const StepArrow = styled.div`
  color: var(--text-muted);
  opacity: 0.5;
  
  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`

const StartButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--bg-primary);
  background: linear-gradient(135deg, var(--accent-primary), #00a8cc);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  margin-bottom: var(--space-2xl);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.4);
  }
`

const ButtonArrow = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`

const MainContent = styled.main`
  width: 100%;
  flex: 1;
`

const Footer = styled.footer`
  width: 100%;
  padding: var(--space-2xl) var(--space-lg);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
`

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
`

const FooterBrand = styled.div`
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
`

const FooterText = styled.p`
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
`

export default App
