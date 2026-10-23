-- Custom SQL migration file, put your code below! --
-- Seed content: 8 practices and the 8 daily keys, one per check-in state.
INSERT INTO `practices` (`id`, `title`, `duration_seconds`, `description`) VALUES
	('guided-breathing', 'Respiração guiada', 180, 'Uma pausa para acalmar a mente, conectar com o seu corpo e voltar para o presente.'),
	('body-release', 'Soltar o corpo', 240, 'Percorra o corpo com atenção, do rosto aos pés, soltando a tensão que encontrar pelo caminho.'),
	('small-steps', 'Um passo possível', 150, 'Escolha uma ação pequena para hoje e imagine, com calma, cada etapa até concluí-la.'),
	('pause-before-reacting', 'Pausa antes de reagir', 120, 'Respire devagar, nomeie o que sente e deixe a intensidade baixar antes de decidir o próximo passo.'),
	('gentle-welcome', 'Acolher o que sinto', 240, 'Observe a emoção sem querer mudá-la e ofereça a si mesma as palavras que diria a uma amiga.'),
	('quiet-gratitude', 'Gratidão em silêncio', 120, 'Lembre de três coisas simples que estão bem hoje e fique alguns instantes com cada uma.'),
	('daily-intention', 'Intenção do dia', 180, 'Defina como você quer se sentir hoje e escolha um gesto que a aproxime disso.'),
	('inner-listening', 'Escuta interna', 300, 'Sente-se em silêncio e perceba o que pede espaço em você agora, sem pressa de nomear.');
--> statement-breakpoint
INSERT INTO `daily_keys` (`state`, `title`, `text`, `practice_id`) VALUES
	('heavy', 'Um passo de cada vez', 'Hoje você não precisa dar conta de tudo. Escolha uma coisa pequena e permita-se parar depois.', 'body-release'),
	('anxious', 'Voz e Limites', 'Talvez hoje você não precise explicar tanto. Comece reconhecendo o que é verdadeiro para você.', 'guided-breathing'),
	('discouraged', 'Pequenos recomeços', 'O desânimo também passa. Hoje, um gesto pequeno já mostra que você segue em movimento.', 'small-steps'),
	('irritated', 'Antes de responder', 'Sentir irritação é humano. Você pode dar um tempo a si mesma antes de responder.', 'pause-before-reacting'),
	('sensitive', 'Delicadeza com você', 'Estar sensível não é fraqueza. Trate-se hoje com a mesma gentileza que oferece aos outros.', 'gentle-welcome'),
	('at-peace', 'Guardar a calma', 'Que bom estar em paz. Perceba o que a trouxe até aqui e leve isso consigo pelo dia.', 'quiet-gratitude'),
	('hopeful', 'Abrir espaço ao novo', 'A esperança é um bom ponto de partida. Dê a ela um primeiro gesto concreto hoje.', 'daily-intention'),
	('other', 'Do seu jeito', 'O que você sente merece espaço, mesmo sem nome. Comece ouvindo o que é verdadeiro agora.', 'inner-listening');
