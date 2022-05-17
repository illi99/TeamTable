import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Grid, InputAdornment, makeStyles, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { LocationState, useAuth } from '../../../auth/AuthProvider';
import './Login.css'
import React from 'react';
import { ConflictError } from 'src/errors/ConflictError';
import validator from 'validator';
import InfoIcon from '@mui/icons-material/Info';

const Register = (): JSX.Element => {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const [usernameErrorText, setUsernameErrorText] = useState<string>('');
    const [passwordErrorText, setPasswordErrorText] = useState<string>('');
    const [phoneNumberErrorText, setPhoneNumberErrorText] = useState<string>('')
    const [fullnameErrorText, setFullnameErrorText] = useState<string>('');
    const [doesUserAlreadyExist, setDoesUserAlreadyExist] = useState<boolean>(false);

    const [areAllFieldsValid, setAreAllFieldsValid] = useState<boolean>(false);
    const REQUIRED_FIELDS = [username, password, fullName, phoneNumber];
    
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (auth?.loggedInUser?.email) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    useEffect(() => {
        setAreAllFieldsValid(
            REQUIRED_FIELDS.every(field => field.length > 0) && 
            !!!usernameErrorText && 
            !!!passwordErrorText && 
            !!!fullnameErrorText && 
            !!!phoneNumberErrorText
        )
    }, [
        username,
        fullName,
        phoneNumber,
        password,
        usernameErrorText,
        passwordErrorText,
        fullnameErrorText,
        phoneNumberErrorText
    ])

    useEffect(() => {
        if (doesUserAlreadyExist) {
            setUsernameErrorText('Username is taken!')
        }
    }, [doesUserAlreadyExist])
    
    const validateUsername = (username: string): void => {
        setDoesUserAlreadyExist(false);
        const regex = /^\S+$/;
        if (!username) {
            setUsernameErrorText('Field is required')
        } else  {
            setUsernameErrorText(regex.test(username) ? '' : 'Username cannot have spaces in it')
        }
    }

    const validateFullName = (fullname: string): void => {
        const regex = /^[a-zA-Z]+\s{1}[a-zA-Z]+$/;
        if (!fullname) {
            setFullnameErrorText('Field is required')
        } else {
            setFullnameErrorText(regex.test(fullname) ? '' : 'Full name should contain only first and last names') 
        }

    }

    const validatePhoneNumber = (phoneNumber: string): void => {
        const regex = /^[0]\d{2}\d{7}$/;

        if (!phoneNumber) {
            setPhoneNumberErrorText('Field is required');
        } else {
            setPhoneNumberErrorText(regex.test(phoneNumber) ? '' : 'Please enter a valid 10 digit phone number')
        }
    }

    const validatePassword = (password: string): void => {
        if (!password) { 
            setPasswordErrorText('Field is required');
        } else if (!validator.isStrongPassword(password, {
            minLength: 8, 
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            setPasswordErrorText('Password too weak, see requirements');
        } else {
            setPasswordErrorText('');
        }
    }

    const handleSubmit = async () => {
        try {
            await auth.register(username, password, phoneNumber, fullName);

            const state = location.state as LocationState;
            const from = state?.from?.pathname || "/";

            navigate(from, { replace: true })
        } catch (err) {
            if (err instanceof ConflictError) {
                setDoesUserAlreadyExist(true);
            }
        }
        
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <Grid>
                <Paper elevation={10} className={'paper-style'} style={{ padding: '10px' }}>
                    <div style={{ marginBottom: '10px', maxWidth:'500px' }}>
                        <Grid textAlign={'center'}>
                            <h2>Register</h2>
                        </Grid>
                        <TextField label='Username'
                            name="username"
                            placeholder='Enter username'
                            variant="standard"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() => validateUsername(username)}
                            error={!!usernameErrorText}
                            helperText={usernameErrorText}
                            style={{height:'80px' }}
                            fullWidth required 
                        />
                        <TextField label='Full Name'
                            name="fullname"
                            placeholder='Enter full name'
                            variant="standard"
                            value={fullName}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => validateFullName(fullName)}
                            error={!!fullnameErrorText}
                            helperText={(fullnameErrorText)}
                            style={{height:'80px' }}
                            fullWidth required 
                        />
                        <TextField label='Phone Number'
                            name="phone"
                            placeholder='Enter phone number'
                            variant="standard"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onBlur={() => validatePhoneNumber(phoneNumber)}
                            error={!!phoneNumberErrorText }
                            helperText={phoneNumberErrorText}
                            style={{height:'80px' }}
                            fullWidth 
                        />
                        <TextField label='Password'
                            name="password"
                            placeholder='Enter password'
                            variant="standard"
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => validatePassword(password)}
                            error={!!passwordErrorText}
                            helperText={passwordErrorText}
                            fullWidth required 
                            style={{height:'80px' }}
                            InputProps={{
                                startAdornment: ( 
                                  <InputAdornment position="start">
                                    <Tooltip 
                                    aria-multiline={true} 
                                    title={
                                        <>
                                        <Typography color="inherit">A strong password must contains:</Typography>
                                        <Typography color="inherit">* At least 8 charcters </Typography>
                                        <Typography color="inherit">* a minimum of 1 lower case letter [a-z]</Typography>
                                        <Typography color="inherit">* a minimum of 1 upper case letter [A-Z]</Typography>
                                        <Typography color="inherit">* a minimum of 1 numeric character [0-9] </Typography>
                                        <Typography color="inherit">* a minimum of 1 special character </Typography>
                                        </>
                                    }>  
                                        <InfoIcon />
                                    </Tooltip>
                                  </InputAdornment>
                                )
                              }}/>
                    </ div>


                    <div style={{ display: 'flex', justifyContent: 'center'}}>
                        <Button 
                            type='submit'
                            color='primary'
                            variant="contained"
                            className={'button-style'}
                            style={{ width: '50%' }}
                            disabled={!areAllFieldsValid}
                            onClick={() => handleSubmit()}
                        >
                            Sign up
                        </Button>
                    </div>
                </Paper>
            </Grid>
        </div>
    )
}

export default Register