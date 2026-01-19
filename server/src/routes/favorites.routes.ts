import { Router } from 'express';
import * as Favorites from '../services/favorites.service';

const router = Router();

router.get('/', Favorites.getFavorites);
router.post('/toggle', Favorites.toggleFavorite);
router.delete('/:id', Favorites.removeFavorite);

export default router;

