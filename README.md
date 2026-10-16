# Victor - Training

App de treino, cardio e alimentação (Next.js + Neon). Preto e azul, feito para usar no iPhone como app.

## O que tem

- **Treino:** 5 dias de musculação por grupo muscular (Peito+Tríceps, Costas+Bíceps, Pernas, Ombros+Abdômen, Posterior+Glúteos), cardio 3 a 4x por semana.
- **Cronômetro de descanso:** começa sozinho ao marcar uma série e avisa (som, vibração e tela piscando) quando é hora de voltar. Dá para ajustar ±15 s ou pular.
- **Check-in:** botão "Finalizar treino" registra o treino do dia, com a duração.
- **Carga:** campo de kg por exercício, que lembra a carga do último treino.
- **Alimentação:** ~1.800 kcal e 180 g de proteína, refeições para marcar, contador de água (3 L) e lista de itens livres para quando bater fome.
- **Progresso:** peso semanal com gráfico, treinos concluídos e histórico.

Os dados ficam no Neon (tabelas criadas sozinhas no primeiro acesso).

## Colocar no ar (Vercel, grátis)

1. Suba esta pasta para um repositório no GitHub (privado).
2. Em vercel.com, clique em **Add New > Project** e importe o repositório.
3. Em **Environment Variables**, crie:
   - Nome: `DATABASE_URL`
   - Valor: a connection string do Neon (a mesma que você passou, `postgresql://...`)
4. Clique em **Deploy**. A Vercel te dá um link, tipo `victor-training.vercel.app`.

Sem GitHub: dentro da pasta, rode `npx vercel` e depois `npx vercel env add DATABASE_URL` e `npx vercel --prod`.

## Instalar no iPhone

1. Abra o link no **Safari** (precisa ser o Safari).
2. Toque em **Compartilhar** (quadrado com seta para cima).
3. Toque em **Adicionar à Tela de Início** e confirme.

O ícone "Victor Training" aparece na tela inicial e abre em tela cheia, como um app.

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # coloque sua DATABASE_URL
npm run dev
```

## Observações

- O alerta do cronômetro toca com o app aberto. O iPhone não deixa páginas web tocarem som com a tela bloqueada. O app mantém a tela acesa durante o descanso.
- O som segue a chave de silencioso do iPhone: deixe o modo silencioso desligado e o volume ligado.
- O app não tem login. Não divulgue o link.
- Troque a senha do banco no Neon depois de publicar, já que ela foi compartilhada em uma conversa.
