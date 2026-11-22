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
import { useFamiliar } from '../hooks/useFamiliares';

export default function FamiliarFormPage() {
  const { id } = useParams();
  const idNumero = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const familiar = useFamiliar(idNumero);

  const actualizar = useMutation({
    mutationFn: (datos: PersonaFormValues) => {
      if (!familiar.data) {
        throw new Error('No se encontraron los datos del familiar.');
      }

      return personaService.actualizar(
        familiar.data.persona_id,
        personaFormAPayload(datos),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['familiares'] });
      navigate(`/familiares/${idNumero}`);
    },
    onError: (error) => {
      setErrorApi(obtenerMensajeError(error));
    },
  });

  if (familiar.data && !familiar.data.persona) {
    return (
      <>
        <PageHeader titulo="Editar familiar" />
        <div className="panel">
          <div className="aviso aviso-error" role="alert">
            No se encontraron los datos personales asociados a este familiar.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Editar familiar"
        descripcion="Modificá los datos personales del familiar."
      />

      <div className="panel">
        <StateView cargando={familiar.isLoading} error={familiar.error}>
          {familiar.data?.persona && (
            <FormularioEdicion
              valoresIniciales={{
                nombre: familiar.data.persona.nombre,
                apellido: familiar.data.persona.apellido,
                dni: familiar.data.persona.dni,
                fecha_nacimiento:
                  familiar.data.persona.fecha_nacimiento ?? '',
                telefono: familiar.data.persona.telefono ?? '',
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

          <Link className="btn btn-secundario" to="/familiares">
            Cancelar
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
