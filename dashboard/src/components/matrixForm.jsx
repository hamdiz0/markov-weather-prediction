import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Zap } from 'lucide-react';

const STATIONS = {
  "DTKA": "Tabarka",
  "DTMB": "Monastir",
  "DTNH": "Enfidha",
  "DTTA": "Tunis",
  "DTTB": "Bizerte",
  "DTTF": "Gafsa",
  "DTTJ": "Djerba",
  "DTTK": "Kairouan",
  "DTTL": "Kelibia",
  "DTTN": "Jendouba",
  "DTTR": "El Borma",
  "DTTX": "Sfax",
  "DTTZ": "Tozeur"
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// Keyframes
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export default function MatrixForm({ onSubmit, isLoading }) {
  const [station, setStation] = useState("DTTA");
  const [fromDate, setFromDate] = useState("2020-01-01");
  const [toDate, setToDate] = useState("2025-12-01");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    const [fromYear, fromMonth, fromDay] = fromDate.split('-');
    const [toYear, toMonth, toDay] = toDate.split('-');

    const userData = {
      station,
      fromDate: {
        year: parseInt(fromYear),
        month: parseInt(fromMonth),
        day: parseInt(fromDay)
      },
      toDate: {
        year: parseInt(toYear),
        month: parseInt(toMonth),
        day: parseInt(toDay)
      }
    };

    onSubmit(userData);
  };

  return (
    <FormContainer
      as={motion.div}
      variants={formVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <FormHeader>
        <SectionLabel>
          <span className="number">01</span>
          <span className="text">Configure</span>
        </SectionLabel>
        <FormTitle>MATRIX GENERATOR</FormTitle>
        <FormDescription>
          Select a weather station and date range to generate the Markov transition matrix
        </FormDescription>
      </FormHeader>

      <FormGrid>
        <InputGroup>
          <InputLabel>
            <MapPin size={14} />
            Weather Station
          </InputLabel>
          <SelectWrapper>
            <StyledSelect 
              value={station} 
              onChange={(e) => setStation(e.target.value)}
            >
              {Object.entries(STATIONS).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </StyledSelect>
            <SelectArrow>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SelectArrow>
          </SelectWrapper>
        </InputGroup>

        <InputGroup>
          <InputLabel>
            <Calendar size={14} />
            Start Date
          </InputLabel>
          <StyledInput 
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <InputLabel>
            <Calendar size={14} />
            End Date
          </InputLabel>
          <StyledInput 
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </InputGroup>
      </FormGrid>

      <ButtonContainer>
        <GenerateButton 
          onClick={handleSubmit}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          as={motion.button}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          disabled={isLoading}
        >
          <ButtonContent>
            {isLoading ? (
              <>
                <ButtonSpinner />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Generate Matrix</span>
              </>
            )}
          </ButtonContent>
          <ButtonGlow $isHovered={isHovered && !isLoading} />
        </GenerateButton>
      </ButtonContainer>

      <FormFooter>
        <FooterStat>
          <span className="value">{STATIONS[station]}</span>
          <span className="label">Selected Station</span>
        </FooterStat>
        <FooterDivider />
        <FooterStat>
          <span className="value">{calculateDays(fromDate, toDate)}</span>
          <span className="label">Days of Data</span>
        </FooterStat>
      </FormFooter>
    </FormContainer>
  );
}

function calculateDays(from, to) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate - fromDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays.toLocaleString();
}

// Styled Components
const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  padding: var(--space-2xl);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
    opacity: 0.5;
  }
`

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: var(--space-2xl);
`

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  
  .number {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent-primary);
    padding: 4px 8px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: var(--radius-sm);
  }
  
  .text {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
  }
`

const FormTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
`

const FormDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  
  svg {
    color: var(--accent-primary);
  }
`

const SelectWrapper = styled.div`
  position: relative;
`

const StyledSelect = styled.select`
  width: 100%;
  padding: var(--space-md);
  padding-right: var(--space-2xl);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  appearance: none;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--border-strong);
    background: var(--bg-tertiary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
  }
  
  option {
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: var(--space-sm);
  }
`

const SelectArrow = styled.div`
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
`

const StyledInput = styled.input`
  width: 100%;
  padding: var(--space-md);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--border-strong);
    background: var(--bg-tertiary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
  }
  
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--transition-fast);
    
    &:hover {
      opacity: 1;
    }
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-xl);
`

const GenerateButton = styled.button`
  position: relative;
  padding: var(--space-md) var(--space-2xl);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--bg-primary);
  background: linear-gradient(135deg, var(--accent-primary), #00a8cc);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-base);
  min-width: 200px;
  
  &:hover:not(:disabled) {
    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }
`

const ButtonContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`

const ButtonGlow = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(${props => props.$isHovered ? '100%' : '-100%'});
  transition: transform 0.5s ease;
`

const FormFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-subtle);
`

const FooterStat = styled.div`
  text-align: center;
  
  .value {
    display: block;
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
  }
`

const FooterDivider = styled.div`
  width: 1px;
  height: 30px;
  background: var(--border-default);
`

const ButtonSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: var(--bg-primary);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`
