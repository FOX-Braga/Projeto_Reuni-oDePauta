"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty" role="alert">
      <h1>Não foi possível abrir esta página.</h1>
      <p>Seus registros já salvos permanecem disponíveis.</p>
      <button className="btn btn-primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
