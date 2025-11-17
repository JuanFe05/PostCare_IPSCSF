from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET = "SUPER_SECRET_KEY_IPSCF"
ALGORITHM = "HS256"


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token inválido")
