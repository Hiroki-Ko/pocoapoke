// frontend/src/index.tsx
import { useEffect, useState } from "react";
import { api } from "./lib/api";
import { MasterSelect } from "./components/MasterSelect";
import { MASTER_CLASS } from "./constants";

function Index() {
    type Pokemon = {
      id: number;
      number: number;
      name: string;
      specialty1: string | null;
      specialty2: string | null;
      environment: string | null;
      favorites: string[] | null;
      created_at: string;
      updated_at: string | null;
    };
    type MasterItem = {
      id: number;
      code: number;
      label: string;
    }
    type Master = Record<string, MasterItem[]>;

    const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
    const [masterCodes, setMasterCodes] = useState<Master>({});
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);


    useEffect(() => {
      api.get('/getPokemonData')
        .then((json) => {
            console.log(json);
            setPokemonData(json);
          })
        .catch(console.error);
      
      api.get('/getMasterCode')
         .then((json) => {
            console.log(json);
            setMasterCodes(json);
         })
        .catch(console.error);
    }, []);

    return (
      <div>
        <h2>Pokemon List</h2>
        <table border={1}>
          <thead>
            <tr>
              <th>No.</th>
              <th>なまえ</th>
              <th>得意なこと1</th>
              <th>得意なこと2</th>
              <th>好きな環境</th>
              {[1,2,3,4,5,6].map((n) => (
                <th key={n}>好きなもの{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pokemonData.map((p) => (
              <tr key={p.id}>
                <td>{p.number}</td>
                <td>{p.name}</td>
                <td>{p.specialty1}</td>
                <td>{p.specialty2}</td>
                <td>{p.environment}</td>
                {p.favorites.map((fav, i) => (
                  <td key={i}>{fav}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        <MasterSelect
          className={MASTER_CLASS.SPECIALTY}
          label="得意なこと"
          masterCodes={masterCodes}
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
        />
        <MasterSelect
          className={MASTER_CLASS.ENVIRONMENT}
          label="好きな環境"
          masterCodes={masterCodes}
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
        />
        <MasterSelect
          className={MASTER_CLASS.FAVORITE}
          label="好きなもの"
          masterCodes={masterCodes}
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
        />
      </div>
    );
}

export default Index;