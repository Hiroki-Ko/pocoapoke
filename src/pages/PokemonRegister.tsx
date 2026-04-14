// src/pages/PokemonRegister.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MASTER_CLASS } from "../constants";
import { MasterSelect } from "../components/MasterSelect";
import { useMasterCodes } from "../api/useMasterCodes";

// type Props = {
//     masterCodes: Record<string, { id: number; code: number; label: string }[]>;
//     value: number | null;
//     onChange: (value: number | null) => void;
// }

// export function PokemonRegister({
//     masterCodes,
//     value,
//     onChange,
// }: Props) {
//     return (
//         <div>
//             <input type="textbox" placeholder="name"></input>
//             <MasterSelect
//                 className={MASTER_CLASS.FAVORITE}
//                 label="好きなもの"
//                 masterCodes={masterCodes}
//                 value={value}
//                 onChange={onChange}
//             />
//         </div>
//     );
// }

export default function PokemonRegister () {
    const { data: masterCodes } = useMasterCodes();
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
    const navigate = useNavigate();
    
    return (
        <div>
            <input type="textbox" placeholder="name"></input>
            <MasterSelect
                // className={MASTER_CLASS.SPECIALTY}
                // label="得意なこと"
                className={MASTER_CLASS.FAVORITE}
                label="好きなもの"
                masterCodes={masterCodes}
                value={selectedSpecialty}
                onChange={setSelectedSpecialty}
            />
            <button onClick={() => navigate("/")}>lists</button>
        </div>
    );
}