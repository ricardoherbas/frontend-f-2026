import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerMensajeError } from '@/core/api/errors';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { Button } from '@/shared/components/ui/Button';
import { personaService } from '@/features/personas/services/persona.service';
import {
  personaFormAPayload,
  personaSchema,
  type PersonaFormValues,
} from '@/features/personas/validators/persona.validator';
import { PersonaCampos } from '@/features/personas/components/PersonaCampos';
import { useCuidadora } from '../hooks/useCuidadoras';

export default function CuidadoraFormPage() {
  const { id } = useParams();
  const idNumero = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const cuidadora = useCuidadora(idNumero);

  const actualizar = useMutation({
    mutationFn: (datos: PersonaFormValues) => {
      if (!cuidadora.data) {
        throw new Error('No se encontraron los datos de la cuidadora.');
      }

      return personaService.actualizar(
        cuidadora.data.persona_id,
        personaFormAPayload(datos),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cuidadoras'] });
      navigate(`/cuidadoras/${idNumero}`);
    },
    onError: (error) => {
      setErrorApi(obtenerMensajeError(error));
    },
  });

  if (cuidadora.data && !cuidadora.data.persona) {
    return (
      <>
        <PageHeader titulo="Editar cuidadora" />
        <div className="panel">
          <div className="aviso aviso-error" role="alert">
            No se encontraron los datos personales asociados a esta cuidadora.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Editar cuidadora"
        descripcion="Modificá los datos personales de la cuidadora."
      />

      <div className="panel">
        <StateView cargando={cuidadora.isLoading} error={cuidadora.error}>
          {cuidadora.data?.persona && (
            <FormularioEdicion
              valoresIniciales={{
                nombre: cuidadora.data.persona.nombre,
                apellido: cuidadora.data.persona.apellido,
                dni: cuidadora.data.persona.dni,
                fecha_nacimiento:
                  cuidadora.data.persona.fecha_nacimiento ?? '',
                telefono: cuidadora.data.persona.telefono ?? '',
              }}
              enviando={actualizar.isPending}
              error={errorApi}
              onEnviar={(valores) => {
                setErrorApi(null);
                actualizar.mutate(valores);
              }}
            />
          )}
        </StateView>
      </div>
    </>
  );
}

interface FormularioEdicionProps {
  valoresIniciales: PersonaFormValues;
  enviando: boolean;
  error: string | null;
  onEnviar: (valores: PersonaFormValues) => void;
}

function FormularioEdicion({
  valoresIniciales,
  enviando,
  error,
  onEnviar,
}: FormularioEdicionProps) {
  const metodos = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: valoresIniciales,
  });

  return (
    <FormProvider {...metodos}>
      <form
        className="form-grid"
        onSubmit={metodos.handleSubmit(onEnviar)}
        noValidate
      >
        {error && (
          <div className="aviso aviso-error" role="alert">
            {error}
          </div>
        )}

        <PersonaCampos />

        <div className="form-acciones">
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar cambios'}
          </Button>

          <Link className="btn btn-secundario" to="/cuidadoras">
            Cancelar
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
